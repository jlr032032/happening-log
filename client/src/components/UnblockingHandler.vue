<template>
	<v-dialog v-model="unblockingDialog">
		<v-card>
			<v-card-title class="custom--title-2 primary--text">
				Usuario bloqueado
			</v-card-title>
			<v-card-text>
				El usuario está bloqueado. Al aceptar, se enviará un
				correo electrónico con un enlace para el desbloqueo
			</v-card-text>
			<v-card-actions>
				<v-spacer />
				<v-btn
					text
					@click="closeUnblockingDialog()"
				>
					Cancelar
				</v-btn>
				<v-btn
					class="primary"
					@click="closeUnblockingDialog(true)"
				>
					Aceptar
				</v-btn>
			</v-card-actions>
		</v-card>
	</v-dialog>
</template>

<script>
	import requester from '@/helpers/requester'
	export default {
		name: 'UnblockingHandler',
		props: {
			value: { type: Boolean, default: false },
			email: { type: String }
		},
		data: () => ({
			unblockingDialog: false
		}),
		created() {
			this.unblockingDialog = this.value
		},
		watch: {
			value(value) {
				this.unblockingDialog = value
			}
		},
		methods: {
			async closeUnblockingDialog(sendEmail) {
				if ( sendEmail ) {
					const data = { email: this.email }
					const response = await requester.post('/user/unblocking-email', data)
					if ( response && response.status===200 ) {
						const message = `Se envió un correo a ${this.email} mediante el `
							+ 'que se podrá desbloquear el usuario'
						this.$showErrorDialog({ message })
						this.unblockingDialog = false
						this.$emit('input', false)
					} else {
						this.$showErrorDialog()
					}
				} else {
					this.unblockingDialog = false
					this.$emit('input', false)
				}
			}
		}
	}
</script>
