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

const mapImage = new Image();
import mapPNG from './map.png';
mapImage.src = mapPNG;




const sightCanvas = document.createElement('canvas');
const sightCtx = sightCanvas.getContext('2d');
document.body.appendChild(sightCanvas);
const sightOverlay = new Image();
import invisiblePNG from './invisible.png';
sightOverlay.src = invisiblePNG;

const gScale = 1.24;
sightCanvas.style.transform = "scale(" + gScale + ")";
canvas.style.transform = "scale(" + gScale + ")";


function resize() {
	canvas.width = canvas.offsetWidth;
	canvas.height = canvas.offsetHeight;

	sightCanvas.width = sightCanvas.offsetWidth;
	sightCanvas.height = sightCanvas.offsetHeight;
}
resize();
window.addEventListener('resize', resize);

const box = {
	x: Math.random() * canvas.width,
	y: Math.random() * canvas.height,
	width: 70,
	height: 40,
	velocity: {
		x: 1,
		y: 1,
	},
}

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

		if (!direction || emoteGroup.spawn < Date.now() - 30000) {
			emoteArray.splice(i, 1);
		} else {
			emoteGroup.x += direction.x * emoteGroup.speed * delta;
			emoteGroup.y += direction.y * emoteGroup.speed * delta;

			const emote = emoteGroup.emotes[0];
			ctx.save();
			ctx.translate(emoteGroup.x, emoteGroup.y);
			ctx.rotate(Math.atan2(direction.y, direction.x));
			ctx.drawImage(emote.gif.canvas, -emoteSize / 2, -emoteSize / 2, emoteSize, emoteSize);
			ctx.restore();

			sightCtx.beginPath();
			sightCtx.arc(emoteGroup.x, emoteGroup.y, emoteSize * 0.75, 0, 2 * Math.PI, false);
			sightCtx.fill();
		}

	}

	sightCtx.globalCompositeOperation = 'source-out';
	sightCtx.drawImage(sightOverlay, 0, 0, sightCanvas.width, sightCanvas.height);

	box.x += box.velocity.x * delta * 30;
	box.y += box.velocity.y * delta * 30;
	if (box.x < 0) {
		box.velocity.x = 1 + (Math.random() - 0.5) * 0.5;
		box.x = 0;
	}
	if (box.x > canvas.width - box.width) {
		box.velocity.x = -1 + (Math.random() - 0.5) * 0.5;
		box.x = canvas.width - box.width;
	}
	if (box.y < 0) {
		box.velocity.y = 1 + (Math.random() - 0.5) * 0.5;
		box.y = 0;
	}
	if (box.y > canvas.height - box.height) {
		box.velocity.y = -1 + (Math.random() - 0.5) * 0.5;
		box.y = canvas.height - box.height;
	}
	ctx.strokeStyle = '#ffffff';
	ctx.lineWidth = 2;
	ctx.strokeRect(box.x, box.y, box.width, box.height);

	lastFrame = Date.now();
}

const lanes = [
	[ // top
		{ x: 56, y: 258 },
		{ x: 50, y: 92 },
		{ x: 67, y: 67 },
		{ x: 94, y: 50 },
		{ x: 258, y: 50 },
	],
	[ // top jungle
		{ x: 56, y: 258 },
		{ x: 50, y: 92 },
		{ x: 67, y: 67 },
		{ x: 87, y: 89 },
		{ x: 100, y: 116 },
		{ x: 130, y: 131 },
		{ x: 158, y: 158 },
		{ x: 258, y: 56 },
	],
	[ // mid
		{ x: 56, y: 258 },
		{ x: 124, y: 190 },
		{ x: 190, y: 124 },
		{ x: 258, y: 56 },
	],
	[ // bottom
		{ x: 56, y: 258 },
		{ x: 228, y: 263 },
		{ x: 254, y: 249 },
		{ x: 267, y: 221 },
		{ x: 258, y: 50 },
	],
	[ // bottom jungle
		{ x: 56, y: 258 },
		{ x: 228, y: 263 },
		{ x: 254, y: 249 },
		{ x: 216, y: 196 },
		{ x: 189, y: 184 },
		{ x: 158, y: 158 },
		{ x: 258, y: 56 },
	],
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

function normalize(vector2) { //takes {x, y}, normalizes it, and returns it
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
