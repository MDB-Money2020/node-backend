var dbutil = require('./dbutil.js');
var config = require('./cloudconfig.js').firebaseConf;

var ref = dbutil.refs.stats;

ref.on('value', function(newItem) {
    ref.once().then(function(stats) {
      updateStats(newItem.val(), stats.val());
    });
});

function updateStats(newItem, stats) {
    console.log(stats);
    console.log(newItem);
    var total = stats['totalItems'];
    var cats = ['calorie', 'price', 'protein', 'fat', 'carb', '']
    var updates = {};
    cats.forEach(function(item) {
        updates[item + 'Mean'] = (stats[item + 'Mean'] * total + newItem[item]) / (total + 1);
        updates[item + 'Variance'] = (stats[item + 'Variance'] * total + newItem[item]*newItem[item]) / (total + 1);
    })
    updates['totalItems'] = total + 1;

    ref.update(updates);
}