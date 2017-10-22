var dbutil = require('../utils/dbutil.js');
var ref = dbutil.refs.stats;

function _initStats() {
  return dbutil.refs.statsRef.set({
    caloriesMean: 0,
    caloriesVariance: 0,
    carbsMean: 0,
    carbsVariance: 0,
    fatMean: 0,
    fatVariance: 0,
    priceMean: 0,
    priceVariance: 0,
    proteinMean: 0,
    proteinVariance: 0,
    totalItems: 0
  });
}

function updateStats(newItem) {
  return dbutil.refs.statsRef.once("value").then(function(snapshot) {
    if (!snapshot.exists()) return _initStats();
  }).then(function() {
    return dbutil.refs.statsRef.once("value");
  }).then(function(snapshot) {
    var stats = snapshot.val();
    var total = stats['totalItems'] || 0;
    var cats = ['calories', 'price', 'protein', 'fat', 'carbs']
    var updates = {};
    cats.forEach(function(item) {
      var mean = stats[item + 'Mean'] || 0;
      var variance = stats[item + 'Variance'] || 0;
      var itemVal = newItem[item] || 0;
      updates[item + 'Mean'] = (mean * total + itemVal) / (total + 1);
      var updated_mean = updates[item + 'Mean'] || 0;
      updates[item + 'Variance'] = total / (total + 1) * (variance + mean * mean)
        + itemVal * itemVal - updated_mean * updated_mean;
    });
    updates['totalItems'] = total + 1;
    return dbutil.refs.statsRef.update(updates);
  });
}

module.exports.updateStats = updateStats;
