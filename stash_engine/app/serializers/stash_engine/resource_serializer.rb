require 'fast_jsonapi'
module StashEngine
  class ResourceSerializer
    include FastJsonapi::ObjectSerializer
    attributes :user_id	, :current_resource_state_id, :created_at, :updated_at,:has_geolocation,
        :download_uri, :identifier_id,	:update_uri, :title, :current_editor_id, :publication_date, :accepted_agreement, :tenant_id
  end
end
