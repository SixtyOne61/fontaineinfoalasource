export async function getNews() {
    const res = await fetch("/content/news/news.json");
    return res.json();
}

export async function getEvents() {
    const res = await fetch("/content/events/events.json");
    return res.json();
}

export async function getHikes() {
    const res = await fetch("/content/hikes/hikes.json");
    return res.json();
}