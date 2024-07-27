const News = require('../model/News');
const sequelize = require('../../config/db');
const { resultsToObject, resultToObject, addProp } = require('../../util/sequelize');
const { Op } = require('sequelize');

class NewsController {
    async index(req, res) {
        try {
            let data;
            let thumbnail;
            let promises;
            data = await News(sequelize).findAll();
            promises = await data.map(
                async (item, index) => {
                    thumbnail = await item.getImages();
                    thumbnail = thumbnail.find(
                        (img)=>img.position === 'thumbnail'
                    );
                    return ({ ...resultToObject(item, 'model'), ...thumbnail });
                }

            );
            const news = await Promise.all(promises);
            res.render('news',
                {
                    noSlider: true,
                    news,
                    jsFiles: ['news.js'],
                    cssFiles: ['news.css']
                });
        }
        catch (error) {
            console.error('Error fetching news:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
    async show(req, res) {
        try {
            let data;
            let newsDetail;
            let newNews;
            newNews = await News(sequelize).findAll({ limit: 7, where: {
                published_date: {[Op.gte]: new Date(new Date() - 7 * 24 * 60 * 60 * 1000) }
            }, order: [['published_date', 'DESC']] });
            newNews = await Promise.all(newNews.map(
                async (item, index) => {
                    let thumbnail = await item.getImages();
                    thumbnail = thumbnail.find(
                        (img)=>img.position === 'thumbnail'
                    );
                    return ({ ...resultToObject(item, 'model'), ...thumbnail });
                }
            ));

            data = await News(sequelize).findOne({ where: { slug: req.params.slug } });
            let imgs = await data.getImages();
            imgs = imgs.reduce((newImgs, img, index) => {
                if(img.position === 'thumbnail')
                    return {...newImgs, thumbnail: img.image_url};
                else
                    return {...newImgs, [`content${index}`]: img.image_url};
            }, {})
            newsDetail = {...resultToObject(data, 'model'), ...imgs};
            console.log(newNews);
            res.render('news/news-detail',
                {
                    newNews: newNews,
                    newsDetail: newsDetail,
                    noSlider: true,
                    cssFiles: ['newsDetail.css', 'news.css']
                });
        }
        catch (error) {
            console.error('Error fetching news:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
}

module.exports = new NewsController();