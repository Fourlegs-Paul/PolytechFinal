const PROJECT_FIELDS = [
  "naver_article_id", "author_name", "title", "published_at", "project_url",
  "article_url", "summary", "views", "likes", "comment_count", "comments", "synced_at",
].join(",");

module.exports = async function handler(request, response) {
  if (request.method !== "GET") {
    response.setHeader("Allow", "GET");
    return response.status(405).json({ error: "method_not_allowed" });
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const publishableKey = process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!supabaseUrl || !publishableKey) {
    return response.status(503).json({ error: "supabase_not_configured" });
  }

  try {
    const endpoint = new URL("/rest/v1/class_showcase_projects", supabaseUrl);
    endpoint.searchParams.set("select", PROJECT_FIELDS);
    endpoint.searchParams.set("status", "eq.approved");
    endpoint.searchParams.set("order", "published_at.desc");
    const supabaseResponse = await fetch(endpoint, {
      headers: { apikey: publishableKey, Authorization: `Bearer ${publishableKey}` },
    });

    if (!supabaseResponse.ok) {
      const detail = await supabaseResponse.text();
      console.error("Supabase showcase query failed", supabaseResponse.status, detail.slice(0, 300));
      return response.status(502).json({ error: "showcase_query_failed" });
    }

    const rows = await supabaseResponse.json();
    const projects = rows.map((row) => ({
      naverArticleId: row.naver_article_id,
      author: row.author_name,
      title: row.title,
      publishedAt: row.published_at,
      url: row.project_url,
      articleUrl: row.article_url,
      summary: row.summary,
      views: row.views,
      likes: row.likes,
      commentCount: row.comment_count,
      comments: row.comments,
      syncedAt: row.synced_at,
    }));

    response.setHeader("Cache-Control", "no-store, max-age=0");
    return response.status(200).json({
      source: "supabase",
      sourceUrl: "https://cafe.naver.com/f-e/cafes/31752795/menus/7",
      fromDate: "2026-08-03",
      updatedAt: projects[0]?.syncedAt || new Date().toISOString(),
      scan: { articles: projects.length, projects: projects.length },
      projects,
    });
  } catch (error) {
    console.error("Showcase API failed", error);
    return response.status(500).json({ error: "showcase_api_failed" });
  }
};
