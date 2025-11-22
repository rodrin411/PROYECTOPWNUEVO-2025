import db from "../config/db.js";

export const getAllStreamerChannels = async () => {
    const [rows] = await db.execute("SELECT * FROM streamer_channels");
    return rows;
};

export const createStreamerChannel = async (data) => {
    const { streamer_name, channel_name, platform } = data;

    const [result] = await db.execute(
        "INSERT INTO streamer_channels (streamer_name, channel_name, platform) VALUES (?, ?, ?)",
        [streamer_name, channel_name, platform]
    );

    return { id: result.insertId, ...data };
};
