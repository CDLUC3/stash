require 'fast_jsonapi'
module StashEngine
  class StashIdentifierSerializer
    include FastJsonapi::ObjectSerializer
    attributes :identifier, :identifier_type, :storage_size, :created_at, :updated_at
  end
end
