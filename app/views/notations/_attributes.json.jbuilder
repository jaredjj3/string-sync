json.created_at notation.created_at.to_formatted_s(:iso8601)
json.updated_at notation.updated_at.to_formatted_s(:iso8601)
json.featured notation.featured
json.song_name notation.song_name
json.artist_name notation.artist_name
json.thumbnail_url notation.thumbnail.url
json.duration_ms notation.duration_ms.to_i
json.dead_time_ms notation.dead_time_ms.to_i
json.bpm notation.bpm.to_f
json.featured notation.featured
json.vextab_string notation.vextab_string
