export async function getCropRecommendation(data) {
try {
const res = await fetch("http://localhost:8000/crop", {
method: "POST",
headers: { "Content-Type": "application/json" },
body: JSON.stringify(data),
});
return await res.json();
} catch (err) {
return { error: "Failed to fetch crop recommendation" };
}
}


export async function getFertilizerRecommendation(data) {
try {
const res = await fetch("http://localhost:8000/fertilizer", {
method: "POST",
headers: { "Content-Type": "application/json" },
body: JSON.stringify(data),
});
return await res.json();
} catch (err) {
return { error: "Failed to fetch fertilizer recommendation" };
}
}


export async function getDiseasePrediction(formData) {
try {
const res = await fetch("http://localhost:8000/disease", {
method: "POST",
body: formData,
});
return await res.json();
} catch (err) {
return { error: "Failed to detect disease" };
}
}