const PROJECT_FIELDS = [
  "naver_article_id", "author_name", "title", "published_at", "project_url",
  "article_url", "summary", "views", "likes", "comment_count", "comments", "synced_at",
].join(",");

const bundledFeed = require("../student-projects.json");

function mapSupabaseRow(row) {
  return {
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
  };
}

function mapBundledProject(project) {
  return {
    ...project,
    syncedAt: bundledFeed.updatedAt,
  };
}

function mergeProjects(databaseProjects = []) {
  const merged = new Map();
  databaseProjects.forEach((project) => {
    merged.set(String(project.naverArticleId || project.url), project);
  });
  (bundledFeed.projects || []).forEach((project) => {
    const mapped = mapBundledProject(project);
    merged.set(String(mapped.naverArticleId || mapped.url), mapped);
  });
  return [...merged.values()].sort(
    (a, b) => new Date(b.publishedAt || 0) - new Date(a.publishedAt || 0),
  );
}

module.exports = async function handler(request, response) {
  if (request.method !== "GET") {
    response.setHeader("Allow", "GET");
    return response.status(405).json({ error: "method_not_allowed" });
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const publishableKey = process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!supabaseUrl || !publishableKey) {
    response.setHeader("Cache-Control", "no-store, max-age=0");
    return response.status(200).json(bundledFeed);
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
      response.setHeader("Cache-Control", "no-store, max-age=0");
      return response.status(200).json(bundledFeed);
    }

    const rows = await supabaseResponse.json();
    const projects = mergeProjects(rows.map(mapSupabaseRow));

    response.setHeader("Cache-Control", "no-store, max-age=0");
    return response.status(200).json({
      source: "supabase+build-snapshot",
      sourceUrl: bundledFeed.sourceUrl,
      fromDate: bundledFeed.fromDate,
      updatedAt: bundledFeed.updatedAt || projects[0]?.syncedAt || new Date().toISOString(),
      scan: bundledFeed.scan || { articles: projects.length, projects: projects.length },
      projects,
    });
  } catch (error) {
    console.error("Showcase API failed", error);
    response.setHeader("Cache-Control", "no-store, max-age=0");
    return response.status(200).json(bundledFeed);
  }
};
