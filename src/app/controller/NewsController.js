const News = require('../model/News');
const sequelize = require('../../config/db');
const { resultsToObject, resultToObject, addProp } = require('../../util/sequelize');
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
            data = await News(sequelize).findOne({ where: { slug: req.params.slug } });
            let imgs = await data.getImages();
            imgs = imgs.reduce((newImgs, img, index) => {
                if(img.position === 'thumbnail')
                    return {...newImgs, thumbnail: img.image_url};
                else
                    return {...newImgs, [`content${index}`]: img.image_url};
            }, {})
            newsDetail = {...resultToObject(data, 'model'), ...imgs}
            // newsDetail = resultsToObject(img);
            // newsDetail = { ...data, ...newsDetail };
            res.render('news/news-detail',
                {
                    newsDetail: [newsDetail],
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