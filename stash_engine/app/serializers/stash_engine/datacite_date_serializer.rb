module StashEngine
  class DataciteDateSerializer
    include SerializerMixin

    REJECT_COLUMNS = %w[id resource_id].freeze
    COLUMNS = (StashDatacite::DataciteDate.column_names - REJECT_COLUMNS).freeze

  end
end
