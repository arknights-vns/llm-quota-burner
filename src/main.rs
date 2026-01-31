mod models;
mod scraper_service;
mod routes;
mod templates;

use axum::{
    Router,
    routing::get,
};
use tower_http::{
    services::ServeDir,
    trace::TraceLayer,
};
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};
use std::net::SocketAddr;

#[tokio::main]
async fn main() {
    // Initialize tracing
    tracing_subscriber::registry()
        .with(
            tracing_subscriber::EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| "terra_station_comic_reader=debug,tower_http=debug".into()),
        )
        .with(tracing_subscriber::fmt::layer())
        .init();

    // Build application router
    let app = Router::new()
        // Frontend route
        .route("/", get(routes::index))
        // API routes
        .route("/api/albums", get(routes::get_albums))
        .route("/api/album/:id/photos", get(routes::get_album_photos))
        .route("/health", get(routes::health))
        // Static files
        .nest_service("/static", ServeDir::new("static"))
        .layer(TraceLayer::new_for_http());

    // Run server
    let addr = SocketAddr::from(([127, 0, 0, 1], 3000));
    tracing::info!("🦀 Terra Station Comic Reader starting at http://{}", addr);

    let listener = tokio::net::TcpListener::bind(addr).await.unwrap();
    axum::serve(listener, app).await.unwrap();
}
