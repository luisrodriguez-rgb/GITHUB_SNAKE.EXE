const { run } = require('./lib');

// GitHub Actions expone cada input como INPUT_<NOMBRE> en mayúsculas
const input = (name) => (process.env[`INPUT_${name.toUpperCase()}`] || '').trim();

run({
  username: input('github_user_name'),
  outputs: process.env.INPUT_OUTPUTS || '',
  token: input('github_token')
}).catch((err) => {
  console.log(`::error::${err.message}`);
  process.exit(1);
});
