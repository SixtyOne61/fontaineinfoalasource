export async function getNews() {
    const res = await fetch("/content/news/news.json");
    const data = await res.json();
    return data.items || [];
}

export async function getEvents() {
    const res = await fetch("/content/events/events.json");
    const data = await res.json();
    return data.items || [];
}

export async function getHikes() {
    const res = await fetch("/content/hikes/hikes.json");
    const data = await res.json();
    return data.items || [];
}

export async function getParkings() {
    const res = await fetch("/content/parkings/parkings.json");
    const data = await res.json();
    return data.items || [];
}