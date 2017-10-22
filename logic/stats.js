var dbutil = require('../utils/dbutil.js');
var ref = dbutil.refs.stats;

function updateStats(newItem) {
    return dbutil.refs.statsRef.once("value").then(function(snapshot) {
        var stats = snapshot.val();
        var total = stats['totalItems'];
        var cats = ['calorie', 'price', 'protein', 'fat', 'carb']
        var updates = {};
        cats.forEach(function(item) {
            updates[item + 'Mean'] = (stats[item + 'Mean'] * total + newItem[item]) / (total + 1);
            updates[item + 'Variance'] = (stats[item + 'Variance'] * total + newItem[item] * newItem[item]) / (total + 1);
        })
        updates['totalItems'] = total + 1;
        return dbutil.refs.statsRef.update(updates);
    }).catch(function(error) {
        console.error(error);
    });
}

module.exports.updateStats = updateStats;