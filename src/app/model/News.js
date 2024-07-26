const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    class News extends Model {
        async getImages() {
            const results = await sequelize.query(
                `SELECT image_url, position FROM images WHERE news_id = :newsId`,
                {
                    replacements: { newsId: this.news_id },
                    type: sequelize.QueryTypes.SELECT
                }
            );
            return results;
        }
    }

    News.init({
        news_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        title: {
            type: DataTypes.STRING,
            allowNull: false
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        content: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        author_id: {
            type: DataTypes.STRING,
            allowNull: false
        },
        published_date: {
            type: DataTypes.DATEONLY,
            allowNull: true
        },
        slug: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        }
    }, {
        sequelize,
        modelName: 'News',
        tableName: 'news',
        freezeTableName: true,
        timestamps: false,
        hooks: {
            beforeValidate: async (news, options) => {
                if (news.changed('slug')) {
                    const existingNews = await News.findOne({ where: { slug: news.slug } });
                    if (existingNews && existingNews.news_id !== news.news_id) {
                        throw new Error('Slug must be unique.');
                    }
                }
            }
        }
    });

    return News;
}