require("dotenv").config();
const express = require("express");
const axios = require("axios");
const mongoose = require("mongoose");

const app = express();
app.use(express.json());

const PORT = 5000;
const NEWS_API_KEY = process.env.NEWS_API_KEY;
const MONGO_URI = process.env.MONGO_URI;

mongoose
  .connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error(err));

const favoriteArticleSchema = new mongoose.Schema({
  title: String,
  url: String,
  source: String,
  category: String,
});

const FavoriteArticle = mongoose.model("FavoriteArticle", favoriteArticleSchema);

app.get("/news", async (req, res) => {
  try {
    const { category } = req.query;
    const url = `https://newsapi.org/v2/top-headlines?country=us&category=${category || "general"}&apiKey=${NEWS_API_KEY}`;

    const response = await axios.get(url);
    res.json(response.data.articles);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch news" });
  }
});


app.post("/favorites", async (req, res) => {
  try {
    const { title, url, source, category } = req.body;
    const article = new FavoriteArticle({ title, url, source, category });

    await article.save();
    res.json({ message: "Article saved successfully", article });
  } catch (error) {
    res.status(500).json({ error: "Failed to save article" });
  }
});


app.get("/favorites", async (req, res) => {
  try {
    const articles = await FavoriteArticle.find();
    res.json(articles);
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve favorites" });
  }
});


app.delete("/favorites/:id", async (req, res) => {
  try {
    await FavoriteArticle.findByIdAndDelete(req.params.id);
    res.json({ message: "Article removed from favorites" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete article" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
