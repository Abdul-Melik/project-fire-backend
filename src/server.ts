import app from './app';
import env from './utils/validate-env';

const port = env.PORT;
app.listen(port, () => {
	console.log(`Server running on port ${port}`);
});
