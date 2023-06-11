export const exclude = <User, Key extends keyof User>(user: User, keys: Key[]): Omit<User, Key> => {
	return keys.reduce(
		(result, key) => {
			delete result[key];
			return result;
		},
		{ ...user }
	);
};
