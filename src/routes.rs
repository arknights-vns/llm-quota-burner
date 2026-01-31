use crate::models::{AlbumsResponse, HealthResponse, PhotosResponse};
use crate::scraper_service::ScraperService;
use crate::templates::IndexTemplate;
use axum::{
    extract::Path,
    http::StatusCode,
    response::{Html, IntoResponse, Json},
};

/// Main page handler
pub async fn index() -> impl IntoResponse {
    let template = IndexTemplate;
    match template.render() {
        Ok(html) => Html(html).into_response(),
        Err(err) => {
            tracing::error!("Template error: {}", err);
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                "Failed to render template",
            )
                .into_response()
        }
    }
}

/// Get all albums
pub async fn get_albums() -> impl IntoResponse {
    match ScraperService::fetch_albums().await {
        Ok(albums) => Json(AlbumsResponse {
            albums,
            error: None,
        })
        .into_response(),
        Err(err) => {
            tracing::error!("Error fetching albums: {}", err);
            Json(AlbumsResponse {
                albums: vec![],
                error: Some(format!(
                    "Unable to fetch albums. Facebook page may have changed structure: {}",
                    err
                )),
            })
            .into_response()
        }
    }
}

/// Get photos from a specific album
pub async fn get_album_photos(Path(album_id): Path<String>) -> impl IntoResponse {
    match ScraperService::fetch_album_photos(&album_id).await {
        Ok(photos) => Json(PhotosResponse {
            photos,
            error: None,
        })
        .into_response(),
        Err(err) => {
            tracing::error!("Error fetching photos for album {}: {}", album_id, err);
            Json(PhotosResponse {
                photos: vec![],
                error: Some(format!("Unable to fetch photos: {}", err)),
            })
            .into_response()
        }
    }
}

/// Health check endpoint
pub async fn health() -> impl IntoResponse {
    Json(HealthResponse {
        status: "ok".to_string(),
    })
}
