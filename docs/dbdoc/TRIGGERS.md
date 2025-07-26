| tablename              | trigger_name                             | action_timing | event_manipulation | action_statement                                       |
| ---------------------- | ---------------------------------------- | ------------- | ------------------ | ------------------------------------------------------ |
| posts                  | update_posts_updated_at                  | BEFORE        | UPDATE             | EXECUTE FUNCTION update_updated_at_column()            |
| users                  | on_auth_user_created                     | AFTER         | INSERT             | EXECUTE FUNCTION handle_new_user()                     |
| objects                | update_objects_updated_at                | BEFORE        | UPDATE             | EXECUTE FUNCTION storage.update_updated_at_column()    |
| subscription           | tr_check_filters                         | BEFORE        | INSERT             | EXECUTE FUNCTION realtime.subscription_check_filters() |
| subscription           | tr_check_filters                         | BEFORE        | UPDATE             | EXECUTE FUNCTION realtime.subscription_check_filters() |
| open_dates_cards       | update_open_dates_cards_updated_at       | BEFORE        | UPDATE             | EXECUTE FUNCTION update_open_dates_updated_at()        |
| open_dates_preferences | update_open_dates_preferences_updated_at | BEFORE        | UPDATE             | EXECUTE FUNCTION update_open_dates_updated_at()        |
| users                  | update_users_updated_at                  | BEFORE        | UPDATE             | EXECUTE FUNCTION update_updated_at_column()            |
| comments               | update_comments_updated_at               | BEFORE        | UPDATE             | EXECUTE FUNCTION update_updated_at_column()            |
| conversations          | update_conversations_updated_at          | BEFORE        | UPDATE             | EXECUTE FUNCTION update_updated_at_column()            |
| messages               | update_messages_updated_at               | BEFORE        | UPDATE             | EXECUTE FUNCTION update_updated_at_column()            |
| events                 | update_events_updated_at                 | BEFORE        | UPDATE             | EXECUTE FUNCTION update_updated_at_column()            |
| likes                  | update_post_likes_stats                  | AFTER         | INSERT             | EXECUTE FUNCTION update_post_stats()                   |
| likes                  | update_post_likes_stats                  | AFTER         | DELETE             | EXECUTE FUNCTION update_post_stats()                   |
| comments               | update_post_comments_stats               | AFTER         | INSERT             | EXECUTE FUNCTION update_comment_stats()                |
| comments               | update_post_comments_stats               | AFTER         | DELETE             | EXECUTE FUNCTION update_comment_stats()                |
| posts                  | update_user_posts_stats                  | AFTER         | INSERT             | EXECUTE FUNCTION update_user_stats()                   |
| posts                  | update_user_posts_stats                  | AFTER         | DELETE             | EXECUTE FUNCTION update_user_stats()                   |
| follows                | update_user_follows_stats                | AFTER         | INSERT             | EXECUTE FUNCTION update_user_stats()                   |
| follows                | update_user_follows_stats                | AFTER         | DELETE             | EXECUTE FUNCTION update_user_stats()                   |
| likes                  | create_like_notification                 | AFTER         | INSERT             | EXECUTE FUNCTION create_notification()                 |
| comments               | create_comment_notification              | AFTER         | INSERT             | EXECUTE FUNCTION create_notification()                 |
| follows                | create_follow_notification               | AFTER         | INSERT             | EXECUTE FUNCTION create_notification()                 |