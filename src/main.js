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

	for (let o = emoteArray.length - 1; o >= 0; o--) {
		const emoteGroup = emoteArray[o];

		const position = getLanePosition(emoteGroup.lane, ((Date.now() - emoteGroup.spawn) / emoteGroup.duration) * 3);

		// Keep track of where we should be drawing the next emote per message

		const emote = emoteGroup.emotes[0];
		ctx.drawImage(emote.gif.canvas, position.x - emoteSize/2, position.y - emoteSize/2, emoteSize, emoteSize);

		sightCtx.beginPath();
		sightCtx.arc(position.x, position.y, emoteSize * 0.75, 0, 2 * Math.PI, false);
		sightCtx.fill();

		// Delete a group after 10 seconds
		if (emoteGroup.spawn < Date.now() - emoteGroup.duration) {
			emoteArray.splice(o, 1);
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

// compute step distances for each lane
for (let laneIndex = 0; laneIndex < lanes.length; laneIndex++) {
	const lane = lanes[laneIndex];
	for (let i = 0; i < lane.length - 1; i++) {
		const start = lane[i];
		const end = lane[i + 1];
		const distance = Math.sqrt(Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2));
		lane[i].distance = distance;
	}
}

const getLanePosition = (laneIndex, progress = 1) => { //returns x,y of the point on the lane the emote is at
	const lane = lanes[laneIndex];
	let x = 0;
	let y = 0;
	for (let i = 0; i < lane.length - 1; i++) {
		const start = lane[i];
		const end = lane[i + 1];
		const distance = Math.sqrt(Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2));
		const step = distance / start.distance;
		if (progress > step) {
			x = end.x;
			y = end.y;
			progress -= step;
		} else {
			x = start.x + progress * (end.x - start.x);
			y = start.y + progress * (end.y - start.y);
			break;
		}
	}
	return { x, y };
}

// add a callback function for when a new message with emotes is sent
const emoteArray = [];
ChatInstance.on("emotes", (emotes) => {
	emoteArray.push({
		emotes,
		lane: Math.floor(Math.random() * lanes.length),
		spawn: Date.now(),
		duration: 15000,
	});
})

draw();
