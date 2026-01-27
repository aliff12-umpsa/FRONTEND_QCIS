// src/pages/LineChartComp.jsx

import React from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

export default function LineChartComp({ data }) {
  // Log data to make sure it's being passed properly
  console.log("Data received in LineChartComp:", data);

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="pass" stroke="#82ca9d" />
        <Line type="monotone" dataKey="fail" stroke="#ff7300" />
      </LineChart>
    </ResponsiveContainer>
  );
}
