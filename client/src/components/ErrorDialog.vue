<template>
	<v-dialog v-model="errorDialog.show">
		<v-card>
			<v-card-title class="custom--title-2 primary--text">{{ errorDialog.title }}</v-card-title>
			<v-card-text>{{ errorDialog.message }}</v-card-text>
			<v-card-actions>
				<v-spacer />
				<v-btn
					text
					@click="hideErrorDialog"
				>
					{{ errorDialog.acceptText }}
				</v-btn>
			</v-card-actions>
		</v-card>
	</v-dialog>
</template>

<script>
	import { mapState, mapMutations } from 'vuex'
	export default {
		name: 'ErrorDialog',
		computed: {
			...mapState(['errorDialog'])
		},
		methods: {
			...mapMutations(['hideErrorDialog'])
		}
	}
</script>
