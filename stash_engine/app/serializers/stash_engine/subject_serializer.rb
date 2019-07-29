module StashEngine
  class SubjectSerializer
    include SerializerMixin

    REJECT_COLUMNS = %w[id].freeze
    COLUMNS = (StashDatacite::Subject.column_names - REJECT_COLUMNS).freeze

  end
end
