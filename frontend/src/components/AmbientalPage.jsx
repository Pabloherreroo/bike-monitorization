import { useState, useMemo, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import "../styles/AmbientalPage.css";

const AmbientalPage = ({ isOpen, onClose, bikeData }) => {
    const [timeFilter, setTimeFilter] = useState("7days");
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [monthlyOption, setMonthlyOption] = useState("last30");

    const months = [
        "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
        "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ];

    // Mes actual cuando cargo
    useEffect(() => {
        const currentDate = new Date();
        setSelectedMonth(currentDate.getMonth());
        setSelectedYear(currentDate.getFullYear());
    }, []);

    const calculateAverage = (sum, count) => {
        return count > 0 ? +(sum / count).toFixed(1) : null;
    };

    const processedData = useMemo(() => {
        if (!bikeData || bikeData.length === 0) {
            return { dailyData: [], monthlyData: [], yearlyData: [] };
        }
        // Ordenar datos (más recientes primero)
        const sortedData = [...bikeData].sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
        
        // Agrupar datos por día
        const groupByDay = (data) => {
            const dailyMap = new Map();
            data.forEach((item) => {
                const date = new Date(item.fecha);
                const dateKey = date.toISOString().split("T")[0];

                if (!dailyMap.has(dateKey)) {
                    dailyMap.set(dateKey, {
                        date: dateKey,
                        tempSum: 0,
                        humSum: 0,
                        presSum: 0,
                        calidadSum: 0,
                        count: 0,
                    });
                }
                const dayData = dailyMap.get(dateKey);
                if (item.temperatura !== undefined) dayData.tempSum += item.temperatura;
                if (item.humedad !== undefined) dayData.humSum += item.humedad;
                if (item.presion !== undefined) dayData.presSum += item.presion;
                if (item.calidad_ambiental !== undefined) dayData.calidadSum += item.calidad_ambiental;
                dayData.count++;
            });

            // Promedios diarios
            return Array.from(dailyMap.values())
                .map((day) => ({
                    date: day.date,
                    temperatura: calculateAverage(day.tempSum, day.count),
                    humedad: calculateAverage(day.humSum, day.count),
                    presion: calculateAverage(day.presSum, day.count),
                    calidad_ambiental: calculateAverage(day.calidadSum, day.count),
                }))
                .sort((a, b) => new Date(a.date) - new Date(b.date)); // Ordenar por fecha ascendente
        };

        // Agrupar datos por mes
        const groupByMonth = (data) => {
            const monthlyMap = new Map();
            data.forEach((item) => {
                const date = new Date(item.fecha);
                const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;

                if (!monthlyMap.has(monthKey)) {
                    monthlyMap.set(monthKey, {
                        month: monthKey,
                        date: new Date(date.getFullYear(), date.getMonth(), 1),
                        tempSum: 0,
                        humSum: 0,
                        presSum: 0,
                        calidadSum: 0,
                        count: 0,
                    });
                }
                const monthData = monthlyMap.get(monthKey);
                if (item.temperatura !== undefined) monthData.tempSum += item.temperatura;
                if (item.humedad !== undefined) monthData.humSum += item.humedad;
                if (item.presion !== undefined) monthData.presSum += item.presion;
                if (item.calidad_ambiental !== undefined) monthData.calidadSum += item.calidad_ambiental;
                monthData.count++;
            });

            // Promedios mensuales
            return Array.from(monthlyMap.values())
                .map((month) => ({
                    date: month.date.toISOString().split("T")[0],
                    month: month.month,
                    monthName: months[month.date.getMonth() + 1],
                    year: month.date.getFullYear(),
                    temperatura: calculateAverage(month.tempSum, month.count),
                    humedad: calculateAverage(month.humSum, month.count),
                    presion: calculateAverage(month.presSum, month.count),
                    calidad_ambiental: calculateAverage(month.calidadSum, month.count),
                }))
                .sort((a, b) => new Date(a.date) - new Date(b.date));
        };

        // Filtrado de datos según el periodo seleccionado
        let filteredData = [];
        let dailyData = [];
        let monthlyData = [];
        let yearlyData = [];

        switch (timeFilter) {
            case "7days":
                // Obtener los últimos 7 días con datos
                const uniqueDays = new Set();
                for (const item of sortedData) {
                    const dateKey = new Date(item.fecha).toISOString().split("T")[0];
                    uniqueDays.add(dateKey);
                    if (uniqueDays.size >= 7) break;
                }

                filteredData = sortedData.filter((item) => {
                    const dateKey = new Date(item.fecha).toISOString().split("T")[0];
                    return uniqueDays.has(dateKey);
                });

                dailyData = groupByDay(filteredData);
                if (dailyData.length > 7) {
                    dailyData = dailyData.slice(dailyData.length - 7);
                }
                break;

            case "monthly":
                if (monthlyOption === "last30") {
                    // Últimos 30 días
                    const thirtyDaysAgo = new Date();
                    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                    filteredData = sortedData.filter((item) => new Date(item.fecha) >= thirtyDaysAgo);
                } else {
                    // Mes específico
                    filteredData = sortedData.filter((item) => {
                        const date = new Date(item.fecha);
                        return date.getMonth() === selectedMonth && date.getFullYear() === selectedYear;
                    });
                }
                dailyData = groupByDay(filteredData);
                break;

            case "yearly":
                // Desde el mes siguiente al actual del año pasado hasta el mes actual (total de 1 año)
                const currentDate = new Date();
                const startDate = new Date(currentDate.getFullYear() - 1, currentDate.getMonth(), 1);

                filteredData = sortedData.filter((item) => {
                    const date = new Date(item.fecha);
                    return date >= startDate && date <= currentDate;
                });

                monthlyData = groupByMonth(filteredData);
                yearlyData = monthlyData;
                break;
        }

        return {
            dailyData,
            monthlyData,
            yearlyData,
        };
    }, [bikeData, timeFilter, selectedMonth, selectedYear, monthlyOption, months]);

    if (!isOpen) return null;

    // Funciones de formateo de fechas
    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        return `${date.getDate()}/${date.getMonth() + 1}`;
    };

    const formatMonth = (dateStr) => {
        const date = new Date(dateStr);
        return `${months[date.getMonth() + 1]} ${date.getFullYear()}`;
    };

    // Calcular rangos para los ejes Y
    const calculateYDomain = (data, key) => {
        if (!data || data.length === 0) return [0, 0];
        // Humedad y calidad ambiental siempre 0-100
        if (key === "humedad" || key === "calidad_ambiental") return [0, 100];
        // Temperatura y presión varían según datos disponibles
        const values = data.map((item) => item[key]).filter((val) => val !== null && val !== undefined);
        if (values.length === 0) return [0, 0];
        const min = Math.min(...values);
        const max = Math.max(...values);
        // Margen
        const range = max - min;
        const padding = range * 0.1;

        return [Math.floor(min - padding), Math.ceil(max + padding)];
    };

    return (
        <div className="ambiental-overlay">
            <div className="ambiental-content">
                <div className="ambiental-header">
                    <h2>Datos Meteorológicos de Bilbao</h2>
                    <button className="close-button" onClick={onClose}>
                        ×
                    </button>
                </div>

                <div className="filter-section">
                    <div className="filter-controls">
                        {["7days", "monthly", "yearly"].map((filter) => (
                            <button
                                key={filter}
                                className={`filter-button ${timeFilter === filter ? "active" : ""}`}
                                onClick={() => setTimeFilter(filter)}
                            >
                                {filter === "7days" 
                                    ? "Últimos 7 días con datos" 
                                    : filter === "monthly" 
                                        ? "Mensual" 
                                        : "Anual"}
                            </button>
                        ))}
                    </div>

                    {timeFilter === "monthly" && (
                        <div className="monthly-options">
                            <div className="radio-group">
                                <label>
                                    <input
                                        type="radio"
                                        name="monthlyOption"
                                        value="last30"
                                        checked={monthlyOption === "last30"}
                                        onChange={() => setMonthlyOption("last30")}
                                    />
                                    Últimos 30 días
                                </label>
                                <label>
                                    <input
                                        type="radio"
                                        name="monthlyOption"
                                        value="specificMonth"
                                        checked={monthlyOption === "specificMonth"}
                                        onChange={() => setMonthlyOption("specificMonth")}
                                    />
                                    Mes específico
                                </label>
                            </div>

                            {monthlyOption === "specificMonth" && (
                                <div className="month-selector">
                                    <select 
                                        value={selectedMonth} 
                                        onChange={(e) => setSelectedMonth(Number.parseInt(e.target.value))}
                                    >
                                        {months.map((month, index) => (
                                            <option key={index} value={index}>
                                                {month}
                                            </option>
                                        ))}
                                    </select>
                                    <select 
                                        value={selectedYear} 
                                        onChange={(e) => setSelectedYear(Number.parseInt(e.target.value))}
                                    >
                                        {Array.from(
                                            { length: 2 }, 
                                            (_, i) => new Date().getFullYear() - i
                                        ).map((year) => (
                                            <option key={year} value={year}>
                                                {year}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {(timeFilter === "7days" || timeFilter === "monthly") && (
                    <div className="charts-container">
                        <div className="chart-wrapper">
                            <h3>Temperatura (°C)</h3>
                            <ResponsiveContainer width="100%" height={180}>
                                <LineChart data={processedData.dailyData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="date" tickFormatter={formatDate} tick={{ fontSize: 12 }} />
                                    <YAxis domain={calculateYDomain(processedData.dailyData, "temperatura")} />
                                    <Tooltip
                                        formatter={(value) => [`${value}°C`, "Temperatura"]}
                                        labelFormatter={(label) => formatDate(label)}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="temperatura"
                                        stroke="#FF5722"
                                        activeDot={{ r: 8 }}
                                        name="Temperatura"
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>

                        <div className="chart-wrapper">
                            <h3>Humedad (%)</h3>
                            <ResponsiveContainer width="100%" height={180}>
                                <LineChart data={processedData.dailyData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="date" tickFormatter={formatDate} tick={{ fontSize: 12 }} />
                                    <YAxis domain={calculateYDomain(processedData.dailyData, "humedad")} />
                                    <Tooltip
                                        formatter={(value) => [`${value}%`, "Humedad"]}
                                        labelFormatter={(label) => formatDate(label)}
                                    />
                                    <Line 
                                        type="monotone" 
                                        dataKey="humedad" 
                                        stroke="#2196F3" 
                                        activeDot={{ r: 8 }} 
                                        name="Humedad" 
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>

                        <div className="chart-wrapper">
                            <h3>Presión (hPa)</h3>
                            <ResponsiveContainer width="100%" height={180}>
                                <LineChart data={processedData.dailyData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="date" tickFormatter={formatDate} tick={{ fontSize: 12 }} />
                                    <YAxis domain={calculateYDomain(processedData.dailyData, "presion")} />
                                    <Tooltip
                                        formatter={(value) => [`${value} hPa`, "Presión"]}
                                        labelFormatter={(label) => formatDate(label)}
                                    />
                                    <Line 
                                        type="monotone" 
                                        dataKey="presion" 
                                        stroke="#4CAF50" 
                                        activeDot={{ r: 8 }} 
                                        name="Presión" 
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>

                        <div className="chart-wrapper">
                            <h3>Índice de Calidad Ambiental (%)</h3>
                            <ResponsiveContainer width="100%" height={180}>
                                <LineChart data={processedData.dailyData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="date" tickFormatter={formatDate} tick={{ fontSize: 12 }} />
                                    <YAxis domain={calculateYDomain(processedData.dailyData, "temperatura")} />
                                    <Tooltip
                                        formatter={(value) => [`${value}%`, "calidad_ambiental"]}
                                        labelFormatter={(label) => formatDate(label)}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="calidad_ambiental"
                                        stroke="#9C27B0"
                                        activeDot={{ r: 8 }}
                                        name="Calidad Ambiental"
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                )}

                {timeFilter === "yearly" && (
                    <div className="charts-container">
                        <div className="chart-wrapper">
                            <h3>Temperatura Media Mensual (°C)</h3>
                            <ResponsiveContainer width="100%" height={180}>
                                <LineChart data={processedData.yearlyData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="date" tickFormatter={formatMonth} tick={{ fontSize: 12 }} />
                                    <YAxis domain={calculateYDomain(processedData.yearlyData, "temperatura")} />
                                    <Tooltip
                                        formatter={(value) => [`${value}°C`, "Temperatura"]}
                                        labelFormatter={(label) => formatMonth(label)}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="temperatura"
                                        stroke="#FF5722"
                                        activeDot={{ r: 8 }}
                                        name="Temperatura"
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>

                        <div className="chart-wrapper">
                            <h3>Humedad Media Mensual (%)</h3>
                            <ResponsiveContainer width="100%" height={180}>
                                <LineChart data={processedData.yearlyData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="date" tickFormatter={formatMonth} tick={{ fontSize: 12 }} />
                                    <YAxis domain={[0, 100]} />
                                    <Tooltip
                                        formatter={(value) => [`${value}%`, "Humedad"]}
                                        labelFormatter={(label) => formatMonth(label)}
                                    />
                                    <Line 
                                        type="monotone" 
                                        dataKey="humedad" 
                                        stroke="#2196F3" 
                                        activeDot={{ r: 8 }} 
                                        name="Humedad" 
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>

                        <div className="chart-wrapper">
                            <h3>Presión Media Mensual (hPa)</h3>
                            <ResponsiveContainer width="100%" height={180}>
                                <LineChart data={processedData.yearlyData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="date" tickFormatter={formatMonth} tick={{ fontSize: 12 }} />
                                    <YAxis domain={calculateYDomain(processedData.yearlyData, "presion")} />
                                    <Tooltip
                                        formatter={(value) => [`${value} hPa`, "Presión"]}
                                        labelFormatter={(label) => formatMonth(label)}
                                    />
                                    <Line 
                                        type="monotone" 
                                        dataKey="presion" 
                                        stroke="#4CAF50" 
                                        activeDot={{ r: 8 }} 
                                        name="Presión" 
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>

                        <div className="chart-wrapper">
                            <h3>Índice de Calidad Ambiental Mensual (%)</h3>
                            <ResponsiveContainer width="100%" height={180}>
                                <LineChart data={processedData.yearlyData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="date" tickFormatter={formatMonth} tick={{ fontSize: 12 }} />
                                    <YAxis domain={[0, 100]} />
                                    <Tooltip
                                        formatter={(value) => [`${value}%`, "Calidad Ambiental"]}
                                        labelFormatter={(label) => formatMonth(label)}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="calidad_ambiental"
                                        stroke="#9C27B0"
                                        activeDot={{ r: 8 }}
                                        name="Calidad Ambiental"
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AmbientalPage;