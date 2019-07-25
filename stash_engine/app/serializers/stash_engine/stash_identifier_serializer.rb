require 'fast_jsonapi'
module StashEngine
  class StashIdentifierSerializer
    include FastJsonapi::ObjectSerializer
    attributes :identifier, :identifier_type, :storage_size, :created_at, :updated_at

    has_many :resources
    belongs_to :user
  end
end
