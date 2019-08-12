module StashEngine
  class RightSerializer
    include SerializerMixin

    REJECT_COLUMNS = %w[id resource_id].freeze
    COLUMNS = (StashDatacite::Right.column_names - REJECT_COLUMNS).freeze

  end
end
