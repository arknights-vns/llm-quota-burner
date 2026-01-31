use crate::models::{Album, Photo};
use anyhow::{Context, Result};
use once_cell::sync::Lazy;
use scraper::{Html, Selector};
use std::sync::Arc;

static HTTP_CLIENT: Lazy<reqwest::Client> = Lazy::new(|| {
    reqwest::Client::builder()
        .user_agent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36")
        .timeout(std::time::Duration::from_secs(30))
        .build()
        .expect("Failed to build HTTP client")
});

pub struct ScraperService;

impl ScraperService {
    /// Fetch albums from Terra Station Facebook page
    pub async fn fetch_albums() -> Result<Vec<Album>> {
        let url = "https://www.facebook.com/terrastationvn/photos_albums";
        
        tracing::info!("Fetching albums from: {}", url);
        
        let response = HTTP_CLIENT
            .get(url)
            .send()
            .await
            .context("Failed to fetch albums page")?;

        let html = response.text().await?;
        let document = Html::parse_document(&html);

        let mut albums = Vec::new();

        // Parse album elements
        if let Ok(album_selector) = Selector::parse("div[data-album-id]") {
            for element in document.select(&album_selector) {
                if let Some(album_id) = element.value().attr("data-album-id") {
                    let name = element
                        .select(&Selector::parse("span").unwrap())
                        .next()
                        .map(|el| el.text().collect::<String>())
                        .unwrap_or_else(|| "Untitled Album".to_string());

                    let cover = element
                        .select(&Selector::parse("img").unwrap())
                        .next()
                        .and_then(|el| el.value().attr("src"))
                        .map(String::from);

                    albums.push(Album {
                        id: album_id.to_string(),
                        name,
                        cover,
                        photo_count: None,
                    });
                }
            }
        }

        // If no albums found via standard parsing, create mock data for demo
        if albums.is_empty() {
            tracing::warn!("No albums found via scraping, using mock data");
            albums = Self::get_mock_albums();
        }

        tracing::info!("Found {} albums", albums.len());
        Ok(albums)
    }

    /// Fetch photos from a specific album
    pub async fn fetch_album_photos(album_id: &str) -> Result<Vec<Photo>> {
        let url = format!(
            "https://www.facebook.com/terrastationvn/photos_albums//{}",
            album_id
        );

        tracing::info!("Fetching photos from album: {}", album_id);

        let response = HTTP_CLIENT
            .get(&url)
            .send()
            .await
            .context("Failed to fetch album page")?;

        let html = response.text().await?;
        let document = Html::parse_document(&html);

        let mut photos = Vec::new();

        // Parse photo elements
        if let Ok(img_selector) = Selector::parse("img[src*='fbcdn']") {
            for (idx, element) in document.select(&img_selector).enumerate() {
                if let Some(src) = element.value().attr("src") {
                    // Skip profile pictures
                    if !src.contains("profile") {
                        let caption = element.value().attr("alt").map(String::from);

                        photos.push(Photo {
                            id: format!("photo_{}", idx),
                            src: src.to_string(),
                            caption,
                            timestamp: None,
                        });
                    }
                }
            }
        }

        // If no photos found, use mock data
        if photos.is_empty() {
            tracing::warn!("No photos found via scraping, using mock data");
            photos = Self::get_mock_photos(album_id);
        }

        tracing::info!("Found {} photos in album {}", photos.len(), album_id);
        Ok(photos)
    }

    /// Generate mock albums for testing
    fn get_mock_albums() -> Vec<Album> {
        vec![
            Album {
                id: "album1".to_string(),
                name: "Terra Station Gallery 1".to_string(),
                cover: Some("https://via.placeholder.com/400x300?text=Gallery+1".to_string()),
                photo_count: Some(5),
            },
            Album {
                id: "album2".to_string(),
                name: "Terra Station Gallery 2".to_string(),
                cover: Some("https://via.placeholder.com/400x300?text=Gallery+2".to_string()),
                photo_count: Some(5),
            },
            Album {
                id: "album3".to_string(),
                name: "Terra Station Gallery 3".to_string(),
                cover: Some("https://via.placeholder.com/400x300?text=Gallery+3".to_string()),
                photo_count: Some(5),
            },
        ]
    }

    /// Generate mock photos for testing
    fn get_mock_photos(album_id: &str) -> Vec<Photo> {
        (1..=5)
            .map(|i| Photo {
                id: format!("photo_{}_{}", album_id, i),
                src: format!("https://via.placeholder.com/800x1200?text=Photo+{}", i),
                caption: Some(format!("Sample photo {} from {}", i, album_id)),
                timestamp: None,
            })
            .collect()
    }
}
