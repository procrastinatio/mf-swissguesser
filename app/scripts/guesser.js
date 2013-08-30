// # SwissGuesser
// 
// (Story Map 5)
// 
// A game to look for historical pictures on a map.

// Load data and start game
$.getJSON('data/base.json', function(d) { guesser.configure(d); });

// Main closure
var guesser = {

	// Default language is German
	lang: 'DE',

	// Set up anonymous user profile
	user: { score: 0	},

	// State variables
	config: null, 
	overlay: null, 
	collection: null, 
	currentIndex: 0,
	currentAnswer: null, 
	active: false,
	layers: [], 

	// DOM references
	domOverlay: 	$('#map-overlay'),
	domResults: 	$('#d-result'),
	domLocator: 	$('#d-locator'),
	domBtnNext: 	$('#btn-continue'),
	domBtnStart: 	$('#btn-start'), 
	domStartBox: 	$('#d-start'),
	domPhotoBox: 	$('#d-photobox'), 
	domLightBox: 	$('#d-lightbox'), 

	// ### Initial setup
	configure: function(json) {

		this.config = json.conf;
		this.collection = json.data;
		this.loader( this.collection[0] );

		// Bootstrap UI components
		/*
		$('.modal.fade').on('shown.bs.modal', function () {
			this.domBtnStart.fadeOut();
		}).on('hidden.bs.modal', function () {
			this.domBtnStart.fadeIn('slow');
			// Start the game if the dialog was deactivated
			if (this.active) { 
				this.domLocator.removeClass('hidden');
			}
		});
		*/

		// Fullscreen
		$('.lightbox').on('shown.bs.modal', function () {
			$('.modal-backdrop.in').css('opacity', 1);
		}).on('hidden.bs.modal', function () {
			$('.modal-backdrop.in').remove();
		});

		// Start the game (open dialog)
		this.domStartBox.modal('show');

	},

	// ### Load image data
	loader: function(metadata) {

		// Get image data
		var imgbox = this.domPhotoBox,
				imgsrc = 
					this.config.dataPrefix + metadata.id + 
					this.config.dataSuffix;

		// Populate components
		$('img', imgbox).attr('src', imgsrc);
		$('img', this.domLightBox).attr('src', imgsrc);
		$('h4', imgbox).attr('title', metadata.id);
		$('.image-count', imgbox).html(this.currentIndex+1);
		$('.image-total', imgbox).html(this.collection.length+1);

		// Start guesser
		$('.btn-primary').one('click', function() {
			guesser.challenge(map, [metadata.y, metadata.x]);
		});
	
	},

	// ### Continue to next image
	next: function() {

		if (++this.currentIndex == this.collection.length) 
		this.currentIndex = 0;
		this.loader( this.collection[this.currentIndex] );

	},

	// ### User starts making a guess 
	challenge: function(olMap, coordinates) {

		// Save the correct answer
		this.currentAnswer = coordinates;
		
		this.clear();
		this.active = true;

		// Hide buttons when guessing
		$('.btn.overlay').addClass('hidden');

		// On re-init, clear map
		if (this.overlay != null) {
			return;
		}

		// Get current template
		this.html = this.domOverlay.html();
		this.domOverlay.html(''); // and clear

		// Create an Overlay
		this.overlay =
			new ol.Overlay({
				map: olMap, element: this.domOverlay[0]
			});

		// Bind click event to map
		var self = this;
		olMap.on('click', function(evt) { self.place(evt); });

	}, // -- challenge

	// ### Clear map of answers
	clear: function() {

			$.each(this.layers, function() {
				map.removeLayer(this);
			});
			this.layers = [];
			this.domResults.addClass('hidden');
			this.active = false;

	}, // -- clear

	// ### Place an answer
	place: function(evt) {
		var self = this;
		if (!self.active) return;

		// Update placement
		this.position = evt.getCoordinate();
		this.overlay.setPosition(this.position);
		//console.log(this.position);

		// Show the overlay
		this.domOverlay
			.removeClass('hidden')
			.popover({ 
				'placement': 'top', 'html': true, 
				'content': this.html })
			.popover('show');

		// Link button action
		// NB: this button gets recreated for each overlay
		$('#btn-guess').click(function(evt) {
			evt.preventDefault(); 
			guesser.guess();
			return false;
		});

	}, // -- place

	// ### Submit a guess
	guess: function() {
		
		// Deactivate guessing for this round
		this.active = false;
		//console.log('Making a guess: ', this.position, this.currentAnswer);

		// Create overlay features
		var vectorFeatures = this.paint(
				this.currentIndex + 1, this.position, this.currentAnswer
			);

		// Sets up a new vector layer
		var vectorGuess = new ol.layer.Vector({
			style: new ol.style.Style({ rules: this.rules }),
			source: new ol.source.Vector({
				projection: map.getView().getProjection(),
				parser: new ol.parser.GeoJSON(),
				data: {
					type: 'FeatureCollection',
					features: vectorFeatures
				}
			})
		}); // -- ol.layer.Vector

		// Add layer to the map
		//this.layers.push(map.addLayer(vectorGuess));

		// Calculate distance to answer
		var dist = 
			Math.sqrt(
				Math.pow(Math.abs(this.position[0] - this.currentAnswer[0]), 2) +
				Math.pow(Math.abs(this.position[1] - this.currentAnswer[1]), 2));

		// Calculate score
		var score = parseInt(Math.abs(180000-dist)/10000)*100;
		this.user.score += score;

		// Hide the overlays
		this.domOverlay.popover('hide');
		this.domLocator.addClass('hidden');

		// Update dialog with score results
		this.domResults.find('.score').html(score);
		this.domResults.find('.total').html(this.user.score);
		this.domResults.find('.comment').html('Well done!');

		// Show dialog and continue the game
		this.domResults.removeClass('hidden');
		this.domBtnNext.removeClass('hidden');
		this.next();

	}, // -- guess

	// ### Draw guess on map
	paint: function(label, from, to) {
		return [
				{
					// Line from A to B
					type: 'Feature',
					properties: { color: '#fff' },
					geometry: {
						type: 'LineString', coordinates: [from, to] }
				},{
					// Starting point (the guess)
					type: 'Feature',
					properties: { 
						label: label },
					geometry: {
						type: 'Point', coordinates: from }
				},{
					// Ending point (the real answer)
					type: 'Feature',
					properties: {
						label: label, which: 'answer' },
					geometry: {
						type: 'Point', coordinates: to }
				}
			];
	}, // -- paint

	// ### Vector stylesheet
	rules: [
		// Lines
	  new ol.style.Rule({
	  	filter: 'geometryType("linestring")',
	    symbolizers: [
	      new ol.style.Line({
	        color: ol.expr.parse('color'),
	        width: 2,
	        opacity: 0.4
	      })
	    ]
	  }),
	  // Starting point
	  new ol.style.Rule({
	    filter: 'geometryType("point")',
	    symbolizers: [
	      new ol.style.Shape({
	        size: 40,
	        fillColor: '#aa0', 
	        fillOpacity: 0.8
	      }),
	      new ol.style.Text({
	        color: '#bada55',
	        text: ol.expr.parse('label'),
	        fontFamily: 'Calibri,sans-serif',
	        fontSize: 14
	      })
	    ]
	  }),
	  // Ending point
	  new ol.style.Rule({
	    filter: 'geometryType("point") && which == "answer"',
	    symbolizers: [
	      new ol.style.Shape({
	        size: 40,
	        fillColor: '#0e0',
	        fillOpacity: 0.8,
	        strokeOpacity: 1
	      }),
	      new ol.style.Text({
	        color: '#bada55',
	        text: ol.expr.parse('label'),
	        fontFamily: 'Calibri,sans-serif',
	        fontSize: 14
	      })
	    ]
	  })
	] // -- rules
};