import Router from "express";
import NewsController from "./NewsController.js";

const router = new Router();

router.get("/api/newsAll", /*authMiddleware,*/ NewsController.newsAll);
