class AppUtility {
	static generateGamerTagSearch(gamerTag) {
		return gamerTag ? gamerTag.replace(/ /g, '').toLowerCase() : null;
	}
}

export default AppUtility;
