module StashEngine
  class SizeSerializer
    include SerializerMixin

    REJECT_COLUMNS = %w[id resource_id].freeze
    COLUMNS = (StashDatacite::Size.column_names - REJECT_COLUMNS).freeze

  end
end