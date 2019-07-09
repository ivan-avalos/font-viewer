/*
 *  Font Viewer - visualise your favourite fonts easily.
 *  Copyright (C) 2019  Iván Ávalos <ivan.avalos.diaz@hotmail.com>
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

// +--------------------------------------+
// |  SET YOUR GOOGLE API KEY RIGHT HERE  |
// +--------------------------------------+
var key = '<GOOGLE_FONTS_API_KEY>';

var xhr = new XMLHttpRequest();
var fonts = [];
var fontcache = [];

var Size = Quill.import ('attributors/style/size');
Quill.register(Size, true);

// Initialise Quill editor
var quill = new Quill('.editor', {
	theme: 'snow'
});

if (localStorage['changed']) {
	const content = JSON.parse(localStorage['content']);
	quill.setContents(content);
}

quill.on('text-change', function (d, od, source) {
	if (source == 'user') {
		localStorage['changed'] = true;
		localStorage['content'] = JSON.stringify(quill.getContents());
	}
});

$(document).ready(function () {

	// Load font list from Google Fonts
	xhr.open('GET', 'https://www.googleapis.com/webfonts/v1/webfonts?key=' + key, true);
	xhr.send();
	xhr.addEventListener("readystatechange", loadfonts, false);

	$('#font-selector').on('change', function () {
		loadfont(this.value);
	});
	
	// Load colours from cookies
	if (colour = localStorage['bg-colour']) {
		$('#bg-colour').val(colour);
		setbgcolour();
	}

	if (colour = localStorage['text-colour']) {
		$('#text-colour').val(colour);
		setcolour(colour);
	}
});
function loadfonts (e) {
	if (xhr.readyState == 4 && xhr.status == 200) {
		var json = JSON.parse(xhr.responseText);
		var prev = '';
		var curr = '';
		for (var i = 0; i < json.items.length; i++){
			const typeface = json.items[i].family;
			fonts.push(typeface);
			curr = typeface[0].toUpperCase();
			var optgroup = null;
			if (prev != curr) {
				optgroup = $('<optgroup/>', { label: curr, id: 'group-' + curr });
				$('#font-selector').append(optgroup);
			} else {
				optgroup = $('#group-' + prev);
			}
			const option = $('<option/>', { value: typeface, html: typeface });
			optgroup.append(option);
			prev = curr;
		}
	}

	// Load CDNs from cookies
	const cdns = JSON.parse(localStorage['cdns'] || '[]');
	for (var i = 0; i < cdns.length; i++) {
		let cdn = $(cdns[i]);
		$('head').append(cdn);
	}

	// Load fonts from cookies
	const type = localStorage['type'] || 'google';
	if (type == 'system') {
		$('#custom-font').val(localStorage['font']);
		loadsys ('#custom-font');
	}
	if (type == 'google') {
		$('#font-selector').val(localStorage['font'] || 'Montserrat');
		loadfont(localStorage['font'] || 'Montserrat');
	}
}

// MARK: - Font funtions

function randomfont () {
	const font = fonts[Math.floor(Math.random()*fonts.length)];
	$('#font-selector').val(font);
	loadfont(font);
}

function insertcdn () {
	const cdn = $('#custom-cdn').val();
	const link = $(cdn);
	$('head').append(link);
	$('#custom-cdn').val('');
	storecdn(cdn);
}

function loadsys (selector) {
	const font = $(selector).val();
	$('body').css ('font-family', font);
	$('.editor').css ('font-family', font);
	localStorage['type'] = 'system';
	localStorage['font'] = font;
}

function loadfont (font) {
	$('body').css('font-family', font);
	$('.editor').css('font-family', font);
	localStorage['type'] = 'google';
	localStorage['font'] = font;
	if (fontcache.includes(font)) {
		return;
	}
	fontcache.push(font);
	const css = $('<link/>', {
		href: fonturl(font),
		rel: 'stylesheet'
	});
	$('head').append(css);
	storecdn (css.prop('outerHTML'));
}

function fonturl (font) {
	var url = 'https://fonts.googleapis.com/css?family=';
	url += font.replace(' ', '+');
	url += ':100,200,300,400,500,600,700,800,900';
	url += '&display=swap';
	return url;
}

function getcdns () {
	return JSON.parse (localStorage['cdns'] || '[]');
}

function storecdn (cdn) {
	const cdns = JSON.parse(localStorage['cdns'] || '[]');
	if (cdns.includes(cdn)) {
		return;
	}
	cdns.push(cdn);
	localStorage['cdns'] = JSON.stringify(cdns);
}

// MARK: - Colour functions

function setbgcolour () {
	const colour = $('#bg-colour').val();
	$('body').css('background-color', colour);
	localStorage['bg-colour'] = colour;
	$('*').each (function () {
		$(this).removeClass('bg-light');
		$(this).removeClass('text-dark');
		$(this).css('background-color', colour);
	});
}

function setcolour () {
	const colour = $('#text-colour').val();
	$('body').css('color', colour);
	localStorage['text-colour'] = colour;
	$('*').each (function () {
		$(this).removeClass('text-dark');
		$(this).css('color', colour);
		$(this).css('border-color', colour);
	})
}

// MARK: - Storage functions

function clearstorage () {
	localStorage.clear();
	location.reload();
}
