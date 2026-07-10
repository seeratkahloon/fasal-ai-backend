const express = require("express");
const router  = express.Router();
const axios   = require("axios");
const { protect } = require("../middleware/auth");

router.get("/", protect, async (req, res) => {
  try {
    const city    = req.query.city || "Sargodha";
    //const API_KEY = process.env.OPENWEATHER_API_KEY || "your_key_here";
    const API_KEY = process.env.OPENWEATHER_API_KEY;
     //const API_KEY = "447147b9d8b79209106bf44e4897ac5e";
    const weatherRes = await axios.get(
      `https://api.openweathermap.org/data/2.5/forecast?q=${city},PK&appid=${API_KEY}&units=metric`
    );

    const data    = weatherRes.data;
    const current = data.list[0];

    const forecast = data.list
      .filter((_, i) => i % 8 === 0)
      .slice(0, 5)
      .map((item) => ({
        date:      item.dt_txt.split(" ")[0],
        temp_max:  Math.round(item.main.temp_max),
        temp_min:  Math.round(item.main.temp_min),
        condition: item.weather[0].main,
        humidity:  item.main.humidity,
        rain:      `${Math.round(item.pop * 100)}%`,
        icon:      getWeatherEmoji(item.weather[0].main),
      }));

    // AI farming advice based on weather
    const advice = generateAdvice(current);

    res.json({
      success:  true,
      city:     data.city.name,
      current: {
        temp:      Math.round(current.main.temp),
        humidity:  current.main.humidity,
        wind:      Math.round(current.wind.speed * 3.6),
        condition: current.weather[0].main,
        feels:     Math.round(current.main.feels_like),
      },
      forecast,
      advice,
    });

  } catch (error) {
    console.error("Weather error:", error.message);
    res.status(500).json({ success: false, message: "Could not fetch weather. Check city name." });
  }
});

function getWeatherEmoji(condition) {
  const map = {
    Clear:        "☀️",
    Clouds:       "⛅",
    Rain:         "🌧️",
    Drizzle:      "🌦️",
    Thunderstorm: "⛈️",
    Snow:         "❄️",
    Mist:         "🌫️",
    Fog:          "🌫️",
  };
  return map[condition] || "🌤️";
}

function generateAdvice(current) {
  const advice = [];
  const temp     = current.main.temp;
  const humidity = current.main.humidity;
  const wind     = current.wind.speed;
  const rain     = current.pop || 0;

  if (temp > 35) {
    advice.push({ icon: "💧", tip: "High temperature! Irrigate crops early morning before 8 AM to reduce evaporation." });
  }
  if (humidity > 80) {
    advice.push({ icon: "⚠️", tip: "High humidity increases disease risk. Inspect crops for fungal infections today." });
  }
  if (rain > 0.5) {
    advice.push({ icon: "🌧️", tip: "Rain expected. Avoid pesticide spraying — wait 24 hours after rain." });
  }
  if (wind > 5) {
    advice.push({ icon: "💨", tip: "Windy conditions. Avoid spraying chemicals as they may drift to other areas." });
  }
  if (temp < 15) {
    advice.push({ icon: "🥶", tip: "Cold weather detected. Protect sensitive crops from frost damage tonight." });
  }
  if (advice.length === 0) {
    advice.push({ icon: "✅", tip: "Good weather conditions for farming today. Great time for field work!" });
    advice.push({ icon: "🌾", tip: "Ideal conditions for irrigation and fertilizer application." });
  }

  return advice;
}

module.exports = router;
