export interface GiphyImage {
  url: string;
  width: string;
  height: string;
}

export interface GiphyImages {
  original: GiphyImage;
  fixed_height: GiphyImage;
}

export interface GiphyGif {
  id: string;
  title: string;
  images: GiphyImages;
}

export interface GiphyPagination {
  total_count: number;
  count: number;
  offset: number;
}

export interface GiphyResponse {
  data: GiphyGif[];
  pagination: GiphyPagination;
}
