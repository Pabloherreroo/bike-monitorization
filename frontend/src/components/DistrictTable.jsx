import { useState, useMemo } from "react"
import "../styles/DistrictTable.css"

const DistrictTable = ({ bikeData, isOpen, onClose }) => {
	const [weights, setWeights] = useState({ // valores predefinidos
		roads: 45,
		air: 35,
		noise: 20,
	})
	const [fixedWeight, setFixedWeight] = useState(null)
	const [sortConfig, setSortConfig] = useState({
		key: "totalScore",
		direction: "descending",
	})

	const handleWeightChange = (type, value) => {
		const newValue = Number.parseInt(value, 10)
		if (isNaN(newValue) || newValue < 0) return
		if (newValue > 100) return

		const newWeights = { ...weights }

		// If peso fijado
		if (fixedWeight && fixedWeight !== type) {
			// Para el resto, 100-fijado
			const fixedValue = weights[fixedWeight]
			const availableForOthers = 100 - fixedValue

			newWeights[type] = newValue

			// Para el tercero (el que no edito)
			const otherType = Object.keys(weights).find((t) => t !== type && t !== fixedWeight)
			const remainingValue = availableForOthers - newValue

			// Ajustar si <0
			if (remainingValue < 0) {
				newWeights[type] = availableForOthers
				newWeights[otherType] = 0
			} else {
				newWeights[otherType] = remainingValue
			}
		} else {
			// Si no hay fijado
			newWeights[type] = newValue
			const diff = newValue - weights[type]
			if (diff === 0) return

			// Distribuir entre los otros 2 pesos
			const otherTypes = Object.keys(weights).filter((t) => t !== type)
			const otherSum = otherTypes.reduce((sum, t) => sum + weights[t], 0)

			if (otherSum > 0) {
				otherTypes.forEach((t) => {
				const proportion = weights[t] / otherSum
				newWeights[t] = Math.max(0, Math.round(weights[t] - diff * proportion))
				})
			}
			// Suma = 100%
			const sum = Object.values(newWeights).reduce((a, b) => a + b, 0)
			if (sum !== 100) {
				const lastType = otherTypes[otherTypes.length - 1]
				newWeights[lastType] += 100 - sum
			}
		}
		setWeights(newWeights)
	}

	const toggleFixedWeight = (type) => {
		if (fixedWeight === type) {
			setFixedWeight(null)
		} else {
			setFixedWeight(type)
		}
	}

	const requestSort = (key) => {
		let direction = "ascending"
		if (sortConfig.key === key && sortConfig.direction === "ascending") {
			direction = "descending"
		}
		setSortConfig({ key, direction })
	}

	const tableData = useMemo(() => {
		if (!bikeData || bikeData.length === 0) return []
		const districtMap = {}

		bikeData.forEach((item) => {
			if (!item.barrio) return

			if (!districtMap[item.barrio]) {
				districtMap[item.barrio] = {
				roadScores: [],
				airQuality: [],
				noise: [],
				dates: [],
				}
			}

			if (item.puntuacion_road) districtMap[item.barrio].roadScores.push(Number.parseFloat(item.puntuacion_road))
			if (item.calidad_ambiental) districtMap[item.barrio].airQuality.push(Number.parseFloat(item.calidad_ambiental))
			if (item.ruido) districtMap[item.barrio].noise.push(Number.parseFloat(item.ruido))
			if (item.fecha) districtMap[item.barrio].dates.push(new Date(item.fecha))
		})

		// Avg y ultima fecha para cada zona
		const processedData = Object.entries(districtMap).map(([district, data]) => {
			const avgRoadScore =
				data.roadScores.length > 0 ? data.roadScores.reduce((sum, score) => sum + score, 0) / data.roadScores.length : 0
			const avgAirQuality =
				data.airQuality.length > 0
				? data.airQuality.reduce((sum, quality) => sum + quality, 0) / data.airQuality.length
				: 0
			const avgNoise = data.noise.length > 0 ? data.noise.reduce((sum, noise) => sum + noise, 0) / data.noise.length : 0
			const latestDate = data.dates.length > 0 ? new Date(Math.max(...data.dates.map((d) => d.getTime()))) : null

			// Total score (0-10)
			// Road: 1-4 → convert to 0-10 (invert so 1=10)
			const roadScore = 10 - (avgRoadScore - 1) * (10 / 3)
			// Aire: 0-100 → convert to 0-10
			const airScore = avgAirQuality / 10
			// Ruido: 0-120 → convert to 0-10 (invert)
			const noiseScore = 10 - avgNoise / 12

			const totalScore =
				(roadScore * weights.roads) / 100 + (airScore * weights.air) / 100 + (noiseScore * weights.noise) / 100

			return {
				district,
				roadScore: avgRoadScore,
				airQuality: avgAirQuality,
				noise: avgNoise,
				latestDate,
				totalScore,
			}
		})

		// Ordenar
		if (sortConfig.key) {
			processedData.sort((a, b) => {
				let valueA, valueB
				if (sortConfig.key === "latestDate") {
					valueA = a.latestDate ? a.latestDate.getTime() : 0
					valueB = b.latestDate ? b.latestDate.getTime() : 0
				} else {
					valueA = a[sortConfig.key]
					valueB = b[sortConfig.key]
				}

				if (valueA < valueB) {
					return sortConfig.direction === "ascending" ? -1 : 1
				}
				if (valueA > valueB) {
					return sortConfig.direction === "ascending" ? 1 : -1
				}
				return 0
			})
		}
		return processedData
	}, [bikeData, weights, sortConfig])

	// dd/mm/yyyy hh:mm:ss
	const formatDate = (date) => {
		if (!date) return "N/A"
		const pad = (num) => String(num).padStart(2, "0")
		const day = pad(date.getDate())
		const month = pad(date.getMonth() + 1)
		const year = date.getFullYear()
		const hours = pad(date.getHours())
		const minutes = pad(date.getMinutes())
		const seconds = pad(date.getSeconds())

		return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`
	}

	const getRoadColorClass = (score) => {
		const roundedScore = Math.round(score)
		switch (roundedScore) {
			case 1:
				return "score-green"
			case 2:
				return "score-yellow"
			case 3:
				return "score-orange"
			case 4:
				return "score-red"
			default:
				return "score-green"
		}
	}

	const getSortIndicator = (key) => {
		const isActive = sortConfig.key === key
		const direction = sortConfig.direction === "ascending" ? "▲" : "▼"
		// Devuelve indicador activo o no
		return (
		<span className="sort-indicator" style={{ opacity: isActive ? 1 : 0 }}>
			{direction}
		</span>
		)
	}

	if (!isOpen) return null

	return (
		<div className="district-table-overlay">
			<div className="district-table-container">
				<div className="district-table-header">
					<h2>Evaluación de diferentes distritos</h2>
					<button className="close-button" onClick={onClose}>
						×
					</button>
				</div>
				<div className="district-table-content">
					<table className="district-table">
						<thead>
							<tr>
								<th>
									<div className="sort-header" onClick={() => requestSort("district")}>
										Zona
										{getSortIndicator("district")}
									</div>
								</th>
								<th>
									<div className="sort-header" onClick={() => requestSort("roadScore")}>
										Vías
										{getSortIndicator("roadScore")}
									</div>
									<div className="weight-control">
										<div className="weight-input">
											<input
												type="number"
												min="0"
												max="100"
												value={weights.roads}
												onChange={(e) => handleWeightChange("roads", e.target.value)}
												disabled={fixedWeight === "roads"}
											/>
											<span>%</span>
										</div>
										<button
											className={`fix-weight-btn ${fixedWeight === "roads" ? "fixed" : ""}`}
											onClick={() => toggleFixedWeight("roads")}
										>
											{fixedWeight === "roads" ? "Fijo" : "Fijar"}
										</button>
									</div>
								</th>
								<th>
									<div className="sort-header" onClick={() => requestSort("airQuality")}>
										Aire
										{getSortIndicator("airQuality")}
									</div>
									<div className="weight-control">
										<div className="weight-input">
											<input
												type="number"
												min="0"
												max="100"
												value={weights.air}
												onChange={(e) => handleWeightChange("air", e.target.value)}
												disabled={fixedWeight === "air"}
											/>
											<span>%</span>
										</div>
										<button
											className={`fix-weight-btn ${fixedWeight === "air" ? "fixed" : ""}`}
											onClick={() => toggleFixedWeight("air")}
										>
											{fixedWeight === "air" ? "Fijo" : "Fijar"}
										</button>
									</div>
								</th>
								<th>
									<div className="sort-header" onClick={() => requestSort("noise")}>
										Ruido
										{getSortIndicator("noise")}
									</div>
									<div className="weight-control">
										<div className="weight-input">
											<input
												type="number"
												min="0"
												max="100"
												value={weights.noise}
												onChange={(e) => handleWeightChange("noise", e.target.value)}
												disabled={fixedWeight === "noise"}
											/>
											<span>%</span>
										</div>
										<button
											className={`fix-weight-btn ${fixedWeight === "noise" ? "fixed" : ""}`}
											onClick={() => toggleFixedWeight("noise")}
										>
											{fixedWeight === "noise" ? "Fijo" : "Fijar"}
										</button>
									</div>
								</th>
								<th>
									<div className="sort-header" onClick={() => requestSort("latestDate")}>
										Últimos datos
										{getSortIndicator("latestDate")}
									</div>
								</th>
								<th>
									<div className="sort-header" onClick={() => requestSort("totalScore")}>
										Puntuación total
										{getSortIndicator("totalScore")}
									</div>
								</th>
							</tr>
						</thead>
						<tbody>
							{tableData.map((district) => (
								<tr key={district.district}>
									<td>{district.district}</td>
									<td>
										<div className={`score-indicator ${getRoadColorClass(district.roadScore)}`}>
											{district.roadScore.toFixed(1)}
										</div>
									</td>
									<td>{district.airQuality.toFixed(0)}%</td>
									<td>{district.noise.toFixed(0)}dB</td>
									<td>{formatDate(district.latestDate)}</td>
									<td className="total-score">{district.totalScore.toFixed(1)}/10</td>
								</tr>
							))}
							{tableData.length === 0 && (
								<tr>
									<td colSpan="6" className="no-data">
										No hay datos disponibles
									</td>
								</tr>
							)}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	)
}

export default DistrictTable