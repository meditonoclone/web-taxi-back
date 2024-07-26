module.exports = {
    resultsToObject: function (results, type) {
        if(type === 'model')
            return results.map((item)=>item.dataValues)
        else{
            if(results.length === 0) return
            return results.map((item)=>item[0]());
        }
    },
    resultToObject: function (result, type) {
        if(type === 'model')
            return { ...result.dataValues };
        else{
            if(result.length === 0 || !result) return
            return (result[0]);
        }

    },
    addProp: function (obj, prop) {
        
        Object.assign(obj, prop);
    }
};