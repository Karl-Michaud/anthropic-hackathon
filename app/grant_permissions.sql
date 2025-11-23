-- Grant permissions to authenticated users on whiteboard_data table
GRANT ALL ON whiteboard_data TO authenticated;
GRANT ALL ON whiteboard_data TO anon;

-- Grant permissions on all other tables too
GRANT ALL ON scholarships TO authenticated;
GRANT ALL ON scholarships TO anon;

GRANT ALL ON prompt_personalities TO authenticated;
GRANT ALL ON prompt_personalities TO anon;

GRANT ALL ON prompt_priorities TO authenticated;
GRANT ALL ON prompt_priorities TO anon;

GRANT ALL ON prompt_values TO authenticated;
GRANT ALL ON prompt_values TO anon;

GRANT ALL ON prompt_weights TO authenticated;
GRANT ALL ON prompt_weights TO anon;

GRANT ALL ON drafts TO authenticated;
GRANT ALL ON drafts TO anon;

-- Grant usage on sequences if they exist
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;
