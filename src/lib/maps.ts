/// <reference types="google.maps" />
import type { VerificationSignals } from '../types';
import { hasLikelyOwnWebsiteUrl } from './urlClassification';

const SCRIPT_URL = 'https://maps.googleapis.com/maps/api/js';
const DEFAULT_MIN_REVIEWS = 0;

export interface MapsPlaceCandidate {
  placeId: string;
  name: string;
  address: string;
  rating: number | null;
  userRatingsTotal: number | null;
  category: string;
  hasOpeningHours: boolean;
  hasPhoto: boolean;
  mapsUrl: string;
}

function getApiKey(): string {
  return import.meta.env.VITE_GOOGLE_MAPS_API_KEY ?? '';
}

function buildSignals(
  placeId: string,
  rating: number | null,
  userRatingsTotal: number | null,
  hasOpeningHours: boolean,
  hasPhoto: boolean
): VerificationSignals {
  const total = userRatingsTotal ?? 0;
  const needsVerification = total < 3;
  return {
    placeId,
    mapsUrl: `https://www.google.com/maps/place/?q=place_id:${placeId}`,
    rating,
    userRatingsTotal: userRatingsTotal ?? null,
    hasOpeningHours,
    hasPhoto,
    needsVerification,
  };
}

export function isMapsConfigured(): boolean {
  return !!getApiKey().trim();
}

let loadPromise: Promise<typeof google> | null = null;

export function loadGoogleMaps(): Promise<typeof google> {
  if (typeof window === 'undefined') return Promise.reject(new Error('window not available'));
  const g = (window as unknown as { google?: typeof google }).google;
  if (g?.maps?.places) return Promise.resolve(g);
  if (loadPromise) return loadPromise;
  const key = getApiKey();
  if (!key) return Promise.reject(new Error('Google Maps API キーが設定されていません。.env に VITE_GOOGLE_MAPS_API_KEY を設定してください。'));

  loadPromise = new Promise((resolve, _reject) => {
    const script = document.createElement('script');
    script.src = `${SCRIPT_URL}?key=${key}&libraries=places&callback=initGoogleMaps`;
    script.async = true;
    script.defer = true;
    (window as Window & { initGoogleMaps?: () => void }).initGoogleMaps = () => {
      const g2 = (window as unknown as { google?: typeof google }).google;
      if (g2?.maps?.places) resolve(g2);
      else _reject(new Error('Places API の読み込みに失敗しました'));
    };
    script.onerror = () => _reject(new Error('Google Maps スクリプトの読み込みに失敗しました'));
    document.head.appendChild(script);
  });
  return loadPromise;
}

export async function searchPlacesNoWebsite(
  query: string,
  options: { minReviews?: number; maxResults?: number } = {}
): Promise<MapsPlaceCandidate[]> {
  const { minReviews = DEFAULT_MIN_REVIEWS, maxResults = 20 } = options;
  const google = await loadGoogleMaps();
  const service = new google.maps.places.PlacesService(document.createElement('div'));

  return new Promise((resolve) => {
    service.textSearch(
      { query },
      (
        results: google.maps.places.PlaceResult[] | null,
        status: google.maps.places.PlacesServiceStatus
      ) => {
        if (status !== google.maps.places.PlacesServiceStatus.OK || !results?.length) {
          resolve([]);
          return;
        }
        const withoutWebsite: MapsPlaceCandidate[] = [];
        let checked = 0;
        const checkNext = (index: number) => {
          if (index >= results.length || withoutWebsite.length >= maxResults) {
            resolve(withoutWebsite);
            return;
          }
          const place = results[index];
          const placeId = place.place_id;
          if (!placeId) {
            checkNext(index + 1);
            return;
          }
          service.getDetails(
            {
              placeId,
              fields: ['website', 'opening_hours', 'photos', 'rating', 'user_ratings_total', 'name', 'formatted_address', 'types'],
            },
            (detail: google.maps.places.PlaceResult | null, detailStatus: google.maps.places.PlacesServiceStatus) => {
              checked++;
              if (detailStatus === google.maps.places.PlacesServiceStatus.OK && detail) {
                const raw = detail.website && String(detail.website).trim();
                const hasOwnSite = hasLikelyOwnWebsiteUrl(raw);
                const total = (detail.user_ratings_total as number) ?? 0;
                if (!hasOwnSite && total >= minReviews) {
                  const types = (detail.types as string[]) ?? [];
                  const category = types[0]?.replace(/_/g, ' ') ?? 'store';
                  withoutWebsite.push({
                    placeId,
                    name: (detail.name as string) ?? '（名称なし）',
                    address: (detail.formatted_address as string) ?? '',
                    rating: (detail.rating as number) ?? null,
                    userRatingsTotal: (detail.user_ratings_total as number) ?? null,
                    category,
                    hasOpeningHours: !!(detail.opening_hours),
                    hasPhoto: !!detail.photos?.length,
                    mapsUrl: `https://www.google.com/maps/place/?q=place_id:${placeId}`,
                  });
                }
              }
              if (checked < results.length) checkNext(index + 1);
              else resolve(withoutWebsite);
            }
          );
        };
        checkNext(0);
      }
    );
  });
}

export function candidateToVerificationSignals(c: MapsPlaceCandidate): VerificationSignals {
  return buildSignals(
    c.placeId,
    c.rating,
    c.userRatingsTotal,
    c.hasOpeningHours,
    c.hasPhoto
  );
}
