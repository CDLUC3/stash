module StashEngine
  class VersionSerializer
    include SerializerMixin

    REJECT_COLUMNS = %w[id resource_id].freeze
    COLUMNS = (StashEngine::Version.column_names - REJECT_COLUMNS).freeze

  end
end