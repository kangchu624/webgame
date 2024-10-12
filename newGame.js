const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Ball object
const ball = {
  x: canvas.width / 2,
  y: canvas.height / 2,
  radius: 20,
  dx: 5, // Horizontal speed
  dy: 5  // Vertical speed
};

function updateBall() {
  // Move the ball
  ball.x += ball.dx;
  ball.y += ball.dy;

  // Bounce off the edges
  if (ball.x + ball.radius > canvas.width || ball.x - ball.radius < 0) {
    ball.dx = -ball.dx;
  }
  if (ball.y + ball.radius > canvas.height || ball.y - ball.radius < 0) {
    ball.dy = -ball.dy;
  }

  // Draw the ball
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
  ctx.fillStyle = 'red';
  ctx.fill();

  requestAnimationFrame(updateBall);
}

// Export the startNewGame function
export function startNewGame() {
  updateBall(); // Start the animation loop
}
