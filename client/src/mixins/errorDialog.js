export default {
	methods: {
		$showErrorDialog(values) {
			this.$store.commit('showErrorDialog', values)
		}
	}
}
