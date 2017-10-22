var dbutil = require('../utils/dbutil.js');
var ref = dbutil.refs.stats;

function updateStats(newItem) {
  return dbutil.refs.statsRef.once("value").then(function(snapshot) {
    var stats = snapshot.val();
    var total = stats['totalItems'] || 0;
    var cats = ['calorie', 'price', 'protein', 'fat', 'carb']
    var updates = {};
    cats.forEach(function(item) {
      var mean = stats[item + 'Mean'] || 0;
      var variance = stats[item + 'Variance'] || 0;
      var itemVal = newItem[item] || 0;
      updates[item + 'Mean'] = (mean * total + itemVal) / (total + 1);
      updates[item + 'Variance'] = ((variance) * total + itemVal *
        itemVal) / (total + 1);
    });
    updates['totalItems'] = total + 1;
    return dbutil.refs.statsRef.update(updates);
  });
}

module.exports.updateStats = updateStats;
