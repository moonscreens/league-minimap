import './main.css';
import Chat from 'twitch-chat-emotes';

// a default array of twitch channels to join
let channels = ['moonmoon'];

// the following few lines of code will allow you to add ?channels=channel1,channel2,channel3 to the URL in order to override the default array of channels
const query_vars = {};
const query_parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function (m, key, value) {
	query_vars[key] = value;
});
if (query_vars.channels) {
	channels = query_vars.channels.split(',');
}

// create our chat instance
const ChatInstance = new Chat({
	channels,
	maximumEmoteLimit: 1,
})

const canvas = document.createElement('canvas');
document.body.appendChild(canvas);
canvas.style.zIndex = "100";
const ctx = canvas.getContext('2d');



const sightCanvas = document.createElement('canvas');
const sightCtx = sightCanvas.getContext('2d');
document.body.appendChild(sightCanvas);
const sightOverlay = new Image();
import invisiblePNG from './invisible.png';
sightOverlay.src = invisiblePNG;


function resize() {
	canvas.width = canvas.offsetWidth;
	canvas.height = canvas.offsetHeight;

	sightCanvas.width = sightCanvas.offsetWidth;
	sightCanvas.height = sightCanvas.offsetHeight;
}
resize();
window.addEventListener('resize', resize);

const emoteSize = 20;

let lastFrame = Date.now();
// Called once per frame
function draw() {
	window.requestAnimationFrame(draw);

	sightCtx.globalCompositeOperation = 'normal';
	sightCtx.clearRect(0, 0, sightCanvas.width, sightCanvas.height);

	// number of seconds since the last frame was drawn
	const delta = (Date.now() - lastFrame) / 1000;

	ctx.clearRect(0, 0, canvas.width, canvas.height);

	for (let i = emoteArray.length - 1; i >= 0; i--) {
		const emoteGroup = emoteArray[i];

		const direction = getLaneDirection(emoteGroup); // figure out which direction we're headed

		if (!direction) {
			emoteArray.splice(i, 1);
		} else {
			emoteGroup.x += direction.x * emoteGroup.speed * delta;
			emoteGroup.y += direction.y * emoteGroup.speed * delta;
	
			const emote = emoteGroup.emotes[0];
			ctx.drawImage(emote.gif.canvas, emoteGroup.x - emoteSize / 2, emoteGroup.y - emoteSize / 2, emoteSize, emoteSize);
	
			sightCtx.beginPath();
			sightCtx.arc(emoteGroup.x, emoteGroup.y, emoteSize * 0.75, 0, 2 * Math.PI, false);
			sightCtx.fill();
		}
		
	}

	sightCtx.globalCompositeOperation = 'source-out';
	sightCtx.drawImage(sightOverlay, 0, 0);

	lastFrame = Date.now();
}

const lanes = [
	[ // mid
		{ x: 56, y: 258 },
		{ x: 50, y: 92 },
		{ x: 94, y: 50 },
		{ x: 258, y: 50 },
	],
	[ // top
		{ x: 56, y: 258 },
		{ x: 124, y: 190 },
		{ x: 190, y: 124 },
		{ x: 258, y: 56 },
	],
	[ // bottom
		{ x: 56, y: 258 },
		{ x: 228, y: 263 },
		{ x: 267, y: 221 },
		{ x: 258, y: 50 },
	]
]


function getLaneDirection(emote) {
	// takes an emote, returns the direction it's headed, null if it's not headed anywhere
	// returns direction as { x, y }


	// if the emote is close enough to the next point, increment currentPoint
	if (emote.x > emote.points[emote.currentPoint].x - 1 && emote.x < emote.points[emote.currentPoint].x + 1) {
		emote.currentPoint++;
	}

	// if we've reached the end of the path, return null
	if (emote.currentPoint >= emote.points.length) {
		return null;
	}

	// otherwise, return the normalized direction we're headed
	const direction = {
		x: emote.points[emote.currentPoint].x - emote.x,
		y: emote.points[emote.currentPoint].y - emote.y,
	}
	return normalize(direction);
}

function normalize (vector2) { //takes {x, y}, normalizes it, and returns it
	const length = Math.sqrt(vector2.x * vector2.x + vector2.y * vector2.y);
	return {
		x: vector2.x / length,
		y: vector2.y / length,
	}
}





// add a callback function for when a new message with emotes is sent
const emoteArray = [];
ChatInstance.on("emotes", (emotes) => {
	const emote = {
		emotes,
		lane: Math.floor(Math.random() * lanes.length),
		spawn: Date.now(),
		speed: 20, // moves at 1 unit a second along the given path
		currentPoint: 1, // which point in the path we're at
	}
	emote.x = lanes[emote.lane][0].x;
	emote.y = lanes[emote.lane][0].y;
	emote.points = lanes[emote.lane];
	emoteArray.push(emote);
})

draw();
