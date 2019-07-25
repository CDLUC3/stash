require 'fast_jsonapi'
module StashEngine
  class UserSerializer
    include FastJsonapi::ObjectSerializer
    attributes %w[first_name last_name email uid provider oauth_token created_at updated_at tenant_id last_login role orcid].map(&:intern)
  end
end
