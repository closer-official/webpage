import { collectPlaces } from './collect.js';
import { store } from './data/store.js';
import { fetchPageMeta } from './fetchPageMeta.js';
import { extractDesignFromHtml, analyzeReferenceSites } from './gemini.js';
import { INDUSTRY_QUERIES, INDUSTRIES } from './learningQueries.js';

async function setProgress(phase, current, total) {
  const j = await store.getLearningJob();
  j.phase = phase;
  j.current = current;
  j.total = total;
  await store.setLearningJob(j);
}

/**
 * 学習ジョブを実行する（非同期）。store.learningJob の status を更新する。
 * industry: 単一業種（cafe 等）または 'all'
 * maxResults: 業種あたりの取得件数
 */
export async function runLearningJob(industry, maxResults) {
  const job = await store.getLearningJob();
  if (job.status === 'running') return;
  if (!process.env.GOOGLE_MAPS_API_KEY) {
    job.status = 'failed';
    job.error = 'GOOGLE_MAPS_API_KEY が設定されていません。Vercel の環境変数にサーバー用の Google Maps API キーを追加してください。';
    job.completedAt = new Date().toISOString();
    await store.setLearningJob(job);
    return;
  }
  job.status = 'running';
  job.industry = industry;
  job.maxResults = maxResults;
  job.phase = '収集';
  job.current = 0;
  job.total = industry === 'all' ? INDUSTRIES.length : 1;
  job.result = null;
  job.error = null;
  job.startedAt = new Date().toISOString();
  job.completedAt = null;
  await store.setLearningJob(job);

  try {
    const queries = industry === 'all' ? INDUSTRIES.map((ind) => ({ industry: ind, query: INDUSTRY_QUERIES[ind] })) : [{ industry, query: INDUSTRY_QUERIES[industry] || `${industry}` }];
    const allRefs = [];
    for (let i = 0; i < queries.length; i++) {
      await setProgress('収集', i + 1, queries.length);
      const places = await collectPlaces(queries[i].query, { hasWebsite: true, maxResults, minReviews: 0 });
      for (const p of places) {
        allRefs.push({
          id: `ref-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
          placeId: p.placeId,
          name: p.name,
          address: p.address || '',
          websiteUrl: p.websiteUrl || '',
          rankIndex: p.rankIndex ?? null,
          category: p.category || queries[i].industry,
          title: null,
          metaDescription: null,
          designTraits: null,
          createdAt: new Date().toISOString(),
        });
      }
    }
    await store.setReferenceSites(allRefs);
    const total = allRefs.length;

    await setProgress('メタ・デザイン取得', 0, total);
    const withDesign = !!process.env.GEMINI_API_KEY;
    for (let i = 0; i < allRefs.length; i++) {
      if (i > 0 && i % 10 === 0) await setProgress('メタ・デザイン取得', i, total);
      if (allRefs[i].websiteUrl) {
        const data = await fetchPageMeta(allRefs[i].websiteUrl, { includeHtmlForDesign: withDesign });
        allRefs[i].title = data.title;
        allRefs[i].metaDescription = data.metaDescription;
        if (withDesign && data.htmlSnippet) {
          allRefs[i].designTraits = await extractDesignFromHtml(data.htmlSnippet);
        }
      }
    }
    await store.setReferenceSites(allRefs);

    await setProgress('分析中', 1, 1);
    const insights = await analyzeReferenceSites(allRefs);
    const data = await store.getDesignInsights();
    data.summary = insights.summary;
    data.byIndustry = insights.byCategory || {};
    data.designSummary = insights.designSummary || '';
    data.byIndustryDesign = insights.byCategoryDesign || {};
    data.updatedAt = new Date().toISOString();
    await store.setDesignInsights(data);

    const j = await store.getLearningJob();
    j.status = 'completed';
    j.phase = '完了';
    j.current = j.total;
    j.result = data;
    j.completedAt = new Date().toISOString();
    await store.setLearningJob(j);
  } catch (err) {
    const j = await store.getLearningJob();
    j.status = 'failed';
    j.error = err.message || String(err);
    j.completedAt = new Date().toISOString();
    await store.setLearningJob(j);
  }
}
