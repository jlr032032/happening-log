<template>
	<div class="mx-4 custom--with-fixed-buttons">

		<div class="d-flex align-center">
			<label class="custom--search-label"> Filtrar: </label>
			<v-text-field
				clearable
				autocomplete="off"
				v-model="search.text"
			/>
		</div>

		<div v-show="search.normalizedText">
			<v-sheet
				v-for="(label, index) in search.result"
				:key="index"
				rounded
				class="pa-2 pl-4 mb-2 d-flex align-center custom--container"
				:color="label.color"
				elevation="2"
			>
				<span
					class="flex-grow-1 custom--leaf-text"
					:class="contrastingColor(label.color, 'text')"
				>
					{{ label.name }}
				</span>
				<v-btn
					fab
					elevation="0"
					x-small
					class="flex-shrink-0"
					:class="contrastingColor(label.color, 'text')"
					:color="label.color"
					@click="showLabelDialog(label)"
				>
					<v-icon> mdi-dots-vertical </v-icon>
				</v-btn>
			</v-sheet>
			<div class="d-flex justify-center">
				<span
					v-show="!search.result.length"
					class="custom--no-data-text"
				>
					No hay etiquetas coincidentes
				</span>
			</div>
		</div>

		<label-tree
			v-show="!search.normalizedText"
			:labels="labels"
			@click:details="showLabelDialog"
		/>

		<v-btn
			fab
			medium
			dark
			color="secondary"
			class="custom--main-fab"
			@click="showLabelDialog()"
		>
			<v-icon>mdi-label</v-icon>
		</v-btn>

		<v-dialog v-model="newLabelData.show">
			<v-card>
				<v-card-title class="custom--title-2 primary--text">{{ labelDialogText('title') }}</v-card-title>
				<v-card-text>
					<div class="d-flex align-center">
						<label class="custom--edit-label"> Nombre: </label>
						<v-text-field
							dense
							v-model="newLabelData.name"
						/>
					</div>
					<div class="d-flex align-center">
						<label class="custom--edit-label flex-shrink-0"> Anidar en: </label>
						<label-select
							:labels="labels"
							v-model="newLabelData.parentLabel"
							:exclude="newLabelData.activeLabel"
						/>
					</div>
					<div class="d-flex align-center">
						<label class="custom--edit-label"> Color: </label>
						<v-dialog v-model="newLabelData.colorPickerDialog">
							<template v-slot:activator="{ attrs, on }">
								<v-sheet
									elevation="1"
									class="custom--color-picker"
									:color="newLabelData.color"
									v-bind="attrs"
									v-on="on"
								/>
							</template>
							<template v-slot:default>
								<v-card height="100%">
									<v-card-title class="custom--title-3 primary--text pt-6"> Color de etiqueta </v-card-title>
									<v-card-text>
										<v-color-picker
											swatches-max-height="400px"
											class="ma-2"
											mode="rgba"
											show-swatches
											hide-canvas
											hide-inputs
											hide-sliders
											v-model="newLabelData.color"
											@update:color="closeColorDialog"
										/>
									</v-card-text>
									<v-card-actions>
										<v-spacer />
										<v-btn
											text
											@click="closeColorDialog"
										>
											Cancelar
										</v-btn>
									</v-card-actions>
								</v-card>
							</template>
						</v-dialog>
					</div>
					<v-dialog
						v-model="newLabelData.deleteDialog"
						v-if="newLabelData.activeLabel"
					>
						<template v-slot:activator="{ attrs, on }">
							<v-btn
								v-bind="attrs"
								v-on="on"
								class="mt-5 black white--text custom--full-width"
							>
								Eliminar etiqueta
							</v-btn>
						</template>
						<template v-slot:default>
							<v-card>
								<v-card-title> Eliminar etiqueta </v-card-title>
								<v-card-text> ¿Seguro quieres eliminar esta etiqueta? </v-card-text>
								<v-card-actions>
									<v-spacer />
									<v-btn
										class="primary"
										@click="closeDeleteDialog()"
									>
										Cancelar
									</v-btn>
									<v-btn
										class="black white--text"
										@click="closeDeleteDialog(newLabelData.activeLabel)"
									>
										Eliminar
									</v-btn>
								</v-card-actions>
							</v-card>
						</template>
					</v-dialog>
				</v-card-text>
				<v-card-actions>
					<v-spacer />
					<v-btn
						text
						@click="closeLabelDialog"
					>
						Cancelar
					</v-btn>
					<v-btn
						class="primary"
					>
						{{ labelDialogText('accept') }}
					</v-btn>
				</v-card-actions>
			</v-card>
		</v-dialog>

	</div>
</template>

<script>
	import helpers from '@/mixins/helpers'
	import { mapState, mapActions } from 'vuex'
	import { normalizeText } from 'normalize-text'

	export default {
		name: "Labels",
		mixins: [ helpers ],
		components: {
			LabelTree: () => import('@/components/LabelTree'),
			LabelSelect: () => import('@/components/LabelSelect')
		},
		data: () => ({
			multiple: true,
			newLabelData: {
				name: '',
				color: '#0D47A1',
				parentLabel: null,
				activeLabel: null,
				colorPickerDialog: false,
				deleteDialog: false,
				update: false,
				show: false
			},
			search: {
				text: '',
				normalizedText: '',
				delayId: null,
				result: []
			},
		}),
		watch: {
			'search.text': function () {
				let search = this.search
				const newNormalizedText = search.text ? normalizeText(search.text) : ''
				clearTimeout(search.delayId)
				if ( search.normalizedText!==newNormalizedText ) {
					search.delayId = setTimeout(
						() => {
							search.result = []
							search.normalizedText = newNormalizedText
							search.normalizedText && this.filter(this.labels)
						},
						600
					)
				}
			}
		},
		created() {
			this.linkParentLabels()
		},
		methods: {
			...mapActions(['linkParentLabels']),
			closeColorDialog() {
				this.newLabelData.colorPickerDialog = false
			},
			closeLabelDialog() {
				this.newLabelData.show = false
			},
			closeDeleteDialog(labelToBeDeleted) {
				if ( labelToBeDeleted ) {
					console.log('Delete', labelToBeDeleted)
					this.closeLabelDialog()
				}
				this.newLabelData.deleteDialog = false
			},
			filter(labels) {
				for ( let label of labels ) {
					if ( normalizeText(label.name).includes(this.search.normalizedText) ) {
						this.search.result.push(label)
					}
					if ( label.nestedLabels && label.nestedLabels.length ) {
						this.filter(label.nestedLabels)
					}
				}
			},
			labelDialogText(intendedFor) {
				const texts = {
					title: { true: 'Modificar etiqueta', false: 'Crear etiqueta' },
					accept: { true: 'Modificar', false: 'Crear' }
				}
				return texts[ intendedFor||'accept' ][ Boolean(this.newLabelData.update) ]
			},
			showLabelDialog(label) {
				if ( !label ) {
					this.newLabelData = {
						name: '',
						color: '#0D47A1',
						parentLabel: null,
						activeLabel: null,
						update: false,
						colorPickerDialog: false,
						show: true
					}
				} else {
					this.newLabelData = {
						id: label.id,
						name: label.name,
						color: label.color,
						parentLabel: label.parentLabel,
						activeLabel: label,
						update: true,
						colorPickerDialog: false,
						show: true
					}
				}
			}
		},
		computed: {
			...mapState(['labels'])
		},
		beforeDestroy() {
			clearTimeout(this.search.delayId)
		}
	}
</script>

<style scoped>
	.custom--search-label {
		width: 65px;
	}
	.custom--edit-label {
		width: 78px;
	}
	.custom--color-picker {
		border-radius: 50%;
		width: 40px;
		height: 40px;
	}
	.custom--color-picker-title {
		size: 1rem;
	}
</style>