var fetch = require('node-fetch');
var parseXMLString = require('xml2js').parseString;
var vCard = require('vcards-js');

var sources = [{
	url: 'http://clerk.house.gov/xml/lists/MemberData.xml',
	parser: house
}, {
	url: 'http://www.senate.gov/general/contact_information/senators_cfm.xml',
	parser: senate
}];

function house(data, done) {
	var result = [];
	var members = data.MemberData.members[0].member;
	var info;
	var card;

	for (var member of members) {
		info = member['member-info'][0];
		card = vCard();

		card.namePrefix = info.courtesy[0];
		card.firstName = info.firstname[0];
		card.lastName = info.lastname[0];

		card.organization = 'House of Representatives';
		card.title = 'Representative';
		card.note = info.party[0] + '-' + member['statedistrict'][0];

		card.workPhone = info.phone[0];

		card.workAddress.label = 'Office Address';
		card.workAddress.street = info['office-room'][0] + ' ' + info['office-building'][0];
		card.workAddress.city = 'Washington';
		card.workAddress.stateProvince = 'DC';
		card.workAddress.postalCode = info['office-zip'][0] + '-' + info['office-zip-suffix'][0];
		card.workAddress.countryRegion = 'USA';

		// console.log('---');
		// console.log(info);
		// console.log(card.getFormattedString());

		result.push(card);
		// card.saveToFile('./' + info['sort-name'][0] + '.vcf');
	}

	done(result);
};

function senate(data, done) {
	done(data);
};

var data = Promise.all(sources.map(function(src) {
	return fetch(src.url).then(function (res) {
		return res.text();
	}).then(function (xml) {
		return new Promise(function(fulfill, reject) {
			parseXMLString(xml, function (err, data) {
				if (err) { reject(err); }
				src.parser(data, fulfill);
			});
		});
	});
})).then(function(data) {
	if (data.length === 2) {
		console.log('done!');
	} else {
		console.log('crap!');
	}
});
