import sanka from "@utils/sanka";

interface NewApiDetail {
  title: string;
  alter_title: string;
  poster: string;
  rating: string;
  studio: string;
  released: string;
  duration: string;
  episodes_count: string;
  season: string;
  type: string;
  status: string;
  genres: { name: string; slug: string; url: string }[];
  synopsis: string;
  episodes_list: { episode: string; slug: string; url: string }[];
}

interface AnimeDetails {
  title: string;
  poster: string;
  score: { value: string; users: string };
  japanese: string;
  synonyms: string;
  english: string;
  status: string;
  type: string;
  source: string;
  duration: string;
  episodes: number | null;
  season: string;
  studios: string;
  producers: string;
  aired: string;
  trailer: string;
  batchList: BatchLinkCard[];
  synopsis: Synopsis;
  genreList: GenreLinkCard[];
  episodeList: EpisodeLinkCard[];
}

export default async function animeInfoService(routeParams: {
  animeId: string;
}) {
  const { animeId } = routeParams;
  const result = await sanka<NewApiDetail>(`/detail/${animeId}`);
  const raw = result.data;

  const mappedData: AnimeDetails = {
      title: raw.title,
      poster: raw.poster,
      score: { value: raw.rating || "N/A", users: "" },
      japanese: raw.alter_title,
      synonyms: raw.alter_title,
      english: raw.title,
      status: raw.status || "Unknown",
      type: raw.type,
      source: "Original",
      duration: raw.duration,
      episodes: parseInt(raw.episodes_count) || null,
      season: raw.season,
      studios: raw.studio,
      producers: "",
      aired: raw.released,
      trailer: "",
      batchList: [],
      synopsis: {
          paragraphs: [raw.synopsis],
          connections: []
      },
      genreList: (raw.genres || []).map(g => ({
          title: g.name,
          genreId: g.slug
      })),
      episodeList: (raw.episodes_list || []).map(e => {
          const match = e.episode.match(/Episode\s+(\d+(\.\d+)?)/i);
          
          let displayTitle = e.episode; 

          if (match) {
              displayTitle = `Ep ${match[1]}`;
          } else {
              const slugParts = e.slug.split('-');
              const numIndex = slugParts.indexOf('episode');
              if (numIndex !== -1 && slugParts[numIndex + 1] && /^\d+$/.test(slugParts[numIndex + 1])) {
                  displayTitle = `Ep ${slugParts[numIndex + 1]}`;
              }
          }

          return {
              title: displayTitle, 
              episodeId: e.slug, 
          };
      }).reverse() 
  };

  return { ...result, data: mappedData };
}
